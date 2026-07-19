import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

/* ✅ FIXED PDF ENGINE */
import PDFParser from "pdf2json";

import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";
import { callAI } from "../utils/aiProvider.js";

const router = express.Router();

/* =========================
   STORAGE CONFIG
========================= */
const upload = multer({
    dest: "uploads/",
});

/* =========================
   SMART CATEGORY DETECTOR
========================= */
const detectCategory = (title = "") => {
    const text = title.toLowerCase();

    /* FOOD */
    if (
        text.includes("swiggy") ||
        text.includes("zomato") ||
        text.includes("restaurant") ||
        text.includes("mother dairy") ||
        text.includes("food")
    ) {
        return "Food";
    }

    /* TRANSPORT */
    if (
        text.includes("uber") ||
        text.includes("ola") ||
        text.includes("metro") ||
        text.includes("rapido")
    ) {
        return "Transport";
    }

    /* ENTERTAINMENT */
    if (
        text.includes("netflix") ||
        text.includes("spotify") ||
        text.includes("prime") ||
        text.includes("hotstar")
    ) {
        return "Entertainment";
    }

    /* MEDICAL */
    if (
        text.includes("apollo") ||
        text.includes("hospital") ||
        text.includes("medical") ||
        text.includes("pharmacy")
    ) {
        return "Medical";
    }

    /* SHOPPING */
    if (
        text.includes("amazon") ||
        text.includes("flipkart") ||
        text.includes("myntra")
    ) {
        return "Shopping";
    }

    /* TRANSFERS */
    if (
        text.includes("paid to") ||
        text.includes("money sent") ||
        text.includes("transfer")
    ) {
        return "Transfers";
    }

    return "Miscellaneous";
};

/* =========================
   FORMAT DATE
========================= */
const formatDate = (rawDate = "") => {
    try {
        const cleanDate = String(rawDate || "").split(" ")[0].trim();
        
        let day, month, year;
        if (cleanDate.includes("/")) {
            [day, month, year] = cleanDate.split("/");
        } else if (cleanDate.includes("-")) {
            const parts = cleanDate.split("-");
            // If the first part is 4 digits, it's already YYYY-MM-DD
            if (parts[0] && parts[0].length === 4) {
                return cleanDate;
            }
            [day, month, year] = parts;
        }

        if (day && month && year) {
            // Ensure year is 4 digits
            const parsedYear = year.length === 2 ? `20${year}` : year;
            // Pad month and day to 2 digits
            const parsedMonth = String(month).padStart(2, "0");
            const parsedDay = String(day).padStart(2, "0");
            return `${parsedYear}-${parsedMonth}-${parsedDay}`;
        }

        const parsed = new Date(rawDate);
        if (!isNaN(parsed)) {
            return parsed.toISOString().split("T")[0];
        }

        return new Date().toISOString().split("T")[0];
    } catch {
        return new Date().toISOString().split("T")[0];
    }
};

/* =========================
   CLEAN AMOUNT
========================= */
const parseAmount = (value) => {
    try {
        const cleaned = String(
            value || "0"
        ).replace(/[^0-9.-]+/g, "");

        return (
            Math.abs(parseFloat(cleaned)) || 0
        );
    } catch {
        return 0;
    }
};

/* ==========================================================
   AI-POWERED TRANSACTION CLASSIFIER (Groq)
   Classifies transaction titles as "debit" or "credit" in batch.
   ========================================================== */
const classifyBatchWithAI = async (items) => {
    // 1. Local regex pre-classification (fast, token-saving)
    const classified = items.map((item) => {
        const title = item.title.toLowerCase();
        
        // Explicit debits
        if (title.startsWith("paid to") || title.startsWith("money sent to") || title.startsWith("transfer to") || title.startsWith("sent to") || title.includes("recharge")) {
            return { ...item, type: "debit" };
        }
        // Explicit credits
        if (title.startsWith("received from") || title.startsWith("refund from") || title.startsWith("cashback from") || title.startsWith("money received") || title.startsWith("refunded")) {
            return { ...item, type: "credit" };
        }
        
        // Ambiguous titles (raw names or entities) will be classified by Groq
        return { ...item, type: null };
    });

    const ambiguous = classified.filter(item => item.type === null);
    if (ambiguous.length === 0) {
        return classified;
    }

    try {
        console.log(`🤖 [Groq AI Classifier] Classifying ${ambiguous.length} ambiguous transactions...`);
        
        const promptList = ambiguous.map((item, idx) => `${idx + 1}. Title: "${item.title}"`).join("\n");
        const prompt = `You are a financial parsing engine. Classify each of the following transaction titles as either "debit" (money sent, spent, paid, shopping, bill, recharge, transfer out) or "credit" (money received, credited, deposit, refund, transfer in).
Return your answer ONLY as a JSON array of strings containing "debit" or "credit" corresponding to the list order. Do not include markdown code block formatting or explanations.

Transactions:
${promptList}`;

        const aiResponse = await callAI([
            { role: "system", content: "You output valid JSON lists only. No markdown formatting." },
            { role: "user", content: prompt }
        ], { forceProvider: "groq", temperature: 0.1 });

        if (aiResponse && aiResponse.reply) {
            // Clean markdown blocks if AI accidentally included them
            const cleanReply = aiResponse.reply.replace(/```json|```/g, "").trim();
            const types = JSON.parse(cleanReply);
            
            if (Array.isArray(types) && types.length === ambiguous.length) {
                let ambIdx = 0;
                return classified.map(item => {
                    if (item.type === null) {
                        const assignedType = String(types[ambIdx++]).toLowerCase().trim();
                        return { ...item, type: assignedType === "credit" ? "credit" : "debit" };
                    }
                    return item;
                });
            }
        }
    } catch (err) {
        console.error("🤖 [Groq AI Classifier] Error:", err.message);
    }

    // Fallback: Default to debit if AI fails
    return classified.map(item => ({
        ...item,
        type: item.type || "debit"
    }));
};
router.post(
    "/csv",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({
                    error: "CSV file required",
                });
            }

            const results = [];

            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on("data", (data) => {
                    results.push(data);
                })
                .on("end", async () => {
                    try {
                        const parsedRows = [];

                        for (const row of results) {
                            const title =
                                row["Transaction Details"]?.trim() ||
                                row["Other Transaction Party"]?.trim() ||
                                row["Description"]?.trim() ||
                                row["description"]?.trim() ||
                                row["merchant"]?.trim() ||
                                "Unknown Transaction";

                            const rawAmount = row["Amount"] || row["amount"] || row["debit"] || 0;
                            const amount = parseAmount(rawAmount);
                            const rawDate = row["Date"] || row["date"] || "";
                            const formattedDate = formatDate(rawDate);
                            const category = detectCategory(title);

                            if (!amount || amount <= 0) continue;
                             const rawAmountStr = String(rawAmount || "").trim();
                             const hasMinus = rawAmountStr.includes("-");
                             
                             let type = hasMinus ? "debit" : "credit";

                             // If type is explicitly passed (from frontend Excel mapper), respect it
                             if (row["type"] === "credit" || row["Type"] === "credit") type = "credit";
                             if (row["type"] === "debit" || row["Type"] === "debit") type = "debit";

                             parsedRows.push({
                                 title,
                                 category,
                                 amount,
                                 date: formattedDate,
                                 source: "Paytm CSV",
                                 type
                             });
                         }

                        // Run Groq batch classifier on any ambiguous transaction types
                        const classifiedRows = await classifyBatchWithAI(parsedRows);

                        let importedCount = 0;
                        for (const r of classifiedRows) {
                            const cleanTitle = r.title
                                .toLowerCase()
                                .replace(/paid to|money sent to|transfer to/g, "")
                                .replace(/[^a-z0-9]/g, "")
                                .trim();

                            const [existing] = await db.query(
                                `SELECT id, title FROM expenses 
                                 WHERE user_id = ? AND amount = ? AND date = ? AND type = ?`,
                                [userId, r.amount, r.date, r.type]
                            );

                            const isDuplicate = existing.some(ext => {
                                const extClean = ext.title
                                    .toLowerCase()
                                    .replace(/paid to|money sent to|transfer to/g, "")
                                    .replace(/[^a-z0-9]/g, "")
                                    .trim();
                                return extClean === cleanTitle;
                            });

                            if (isDuplicate) continue;

                            await db.query(
                                `INSERT INTO expenses (user_id, title, category, amount, date, source, type)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [userId, r.title, r.category, r.amount, r.date, r.source, r.type]
                            );
                            importedCount++;
                        }

                        /* DELETE TEMP FILE */
                        fs.unlinkSync(req.file.path);

                        return res.json({
                            success: true,
                            imported: importedCount,
                        });
                    } catch (err) {
                        console.error("CSV PROCESS ERROR:", err);
                        return res.status(500).json({ error: "CSV processing failed" });
                    }
                });
        } catch (err) {
            console.error(
                "CSV UPLOAD ERROR:",
                err
            );

            return res.status(500).json({
                error: "CSV upload failed",
            });
        }
    }
);

/* =========================
   PDF IMPORT ROUTE
========================= */
router.post(
    "/pdf",
    protect,
    upload.single("file"),
    async (req, res) => {
        try {
            const userId = req.user.id;

            if (!req.file) {
                return res.status(400).json({
                    error: "PDF file required",
                });
            }

            /* =========================
               EXTRACT PDF TEXT
            ========================= */

            const pdfParser = new PDFParser();

            const text = await new Promise(
                (resolve, reject) => {
                    pdfParser.on(
                        "pdfParser_dataError",
                        (err) => {
                            reject(err);
                        }
                    );

                    pdfParser.on(
                        "pdfParser_dataReady",
                        () => {
                            resolve(
                                pdfParser.getRawTextContent()
                            );
                        }
                    );

                    pdfParser.loadPDF(
                        req.file.path
                    );
                }
            );

            /* SPLIT INTO LINES */
            const lines = text.split("\n");
            const parsedRows = [];

            for (const line of lines) {
                const lower = line.toLowerCase();

                // Basic detection for line containing a transaction details
                if (
                    lower.includes("paid") ||
                    lower.includes("debit") ||
                    lower.includes("sent") ||
                    lower.includes("transaction") ||
                    lower.includes("received") ||
                    lower.includes("refund") ||
                    lower.includes("cashback")
                ) {
                    // Extract Date
                    let txnDate = new Date().toISOString().split("T")[0];
                    const dateMatch = line.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
                    if (dateMatch) {
                        txnDate = formatDate(dateMatch[0]);
                    }

                    // Extract Amount
                    const amountMatch = line.match(/\d+[\d,]*\.\d{2}/) || line.match(/\d+/);
                    const amount = amountMatch ? parseAmount(amountMatch[0]) : 0;

                    if (!amount || amount <= 0) continue;

                    // Title is the remaining content of the line
                    let title = line
                        .replace(dateMatch ? dateMatch[0] : "", "")
                        .replace(amountMatch ? amountMatch[0] : "", "")
                        .replace(/[\d,]+/, "") // strip other numbers
                        .replace(/₹|rs\.?/gi, "")
                        .trim();

                    if (!title) title = "PDF Imported Transaction";

                    const hasMinus = line.includes("-");
                    const type = hasMinus ? "debit" : "credit";

                    const category = detectCategory(title);

                    parsedRows.push({
                        title,
                        category,
                        amount,
                        date: txnDate,
                        source: "PDF Statement",
                        type
                    });
                }
            }

            // Run Groq AI batch classification
            const classifiedRows = await classifyBatchWithAI(parsedRows);

            let importedCount = 0;
            for (const r of classifiedRows) {
                const cleanTitle = r.title
                    .toLowerCase()
                    .replace(/paid to|money sent to|transfer to/g, "")
                    .replace(/[^a-z0-9]/g, "")
                    .trim();

                const [existing] = await db.query(
                    `SELECT id, title FROM expenses 
                     WHERE user_id = ? AND amount = ? AND date = ? AND type = ?`,
                    [userId, r.amount, r.date, r.type]
                );

                const isDuplicate = existing.some(ext => {
                    const extClean = ext.title
                        .toLowerCase()
                        .replace(/paid to|money sent to|transfer to/g, "")
                        .replace(/[^a-z0-9]/g, "")
                        .trim();
                    return extClean === cleanTitle;
                });

                if (isDuplicate) continue;

                await db.query(
                    `INSERT INTO expenses (user_id, title, category, amount, date, source, type)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, r.title, r.category, r.amount, r.date, r.source, r.type]
                );

                importedCount++;
            }

            /* DELETE TEMP FILE */
            fs.unlinkSync(req.file.path);

            return res.json({
                success: true,
                imported: importedCount,
            });
        } catch (err) {
            console.error(
                "PDF IMPORT ERROR:",
                err
            );

            return res.status(500).json({
                error: "PDF import failed",
            });
        }
    }
);

/* =========================
   DELETE ALL CSV IMPORTS
========================= */
router.delete("/csv", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await db.query(
            `
            DELETE FROM expenses
            WHERE user_id = ?
            AND source = 'Paytm CSV'
            `,
            [userId]
        );

        res.json({
            success: true,
            deleted: result.affectedRows,
            message: `${result.affectedRows} CSV-imported expense(s) deleted`,
        });
    } catch (err) {
        console.error("Delete CSV imports error:", err);
        res.status(500).json({ error: "Failed to delete CSV imports" });
    }
});

/* =========================
   DELETE ALL PDF IMPORTS
========================= */
router.delete("/pdf", protect, async (req, res) => {
    try {
        const userId = req.user.id;

        const [result] = await db.query(
            `
            DELETE FROM expenses
            WHERE user_id = ?
            AND source = 'PDF Statement'
            `,
            [userId]
        );

        res.json({
            success: true,
            deleted: result.affectedRows,
            message: `${result.affectedRows} PDF-imported expense(s) deleted`,
        });
    } catch (err) {
        console.error("Delete PDF imports error:", err);
        res.status(500).json({ error: "Failed to delete PDF imports" });
    }
});

/* ----------------------------------------
   3. UPLOAD IMAGE RECEIPT (FUTURE AI-OCR)
   POST /api/import/image
----------------------------------------- */
router.post("/image", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Future implementation: Pass to OCR service like Tesseract or Google Cloud Vision
    // const extractedData = await extractReceiptDataWithOCR(req.file.path);
    
    // Simulate cleanup
    fs.unlinkSync(req.file.path);

    res.status(501).json({
      message: "Image OCR receipt import architecture is ready but awaiting external API integration in Phase 4.",
      file: req.file.originalname,
    });
  } catch (err) {
    console.error("Image import error:", err);
    res.status(500).json({ error: "Image import failed" });
  }
});

export default router;