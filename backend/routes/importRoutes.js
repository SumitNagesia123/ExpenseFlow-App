import express from "express";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

/* ✅ FIXED PDF ENGINE */
import PDFParser from "pdf2json";

import db from "../db.js";
import { protect } from "../middleware/authMiddleware.js";

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
        /* DD/MM/YYYY → YYYY-MM-DD */
        if (rawDate.includes("/")) {
            const [day, month, year] =
                rawDate.split("/");

            if (day && month && year) {
                return `${year}-${month}-${day}`;
            }
        }

        /* fallback */
        return new Date()
            .toISOString()
            .split("T")[0];
    } catch {
        return new Date()
            .toISOString()
            .split("T")[0];
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

/* =========================
   CSV IMPORT ROUTE
========================= */
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
                        let importedCount = 0;

                        for (const row of results) {
                            /* =========================
                               PAYTM CSV NORMALIZATION
                            ========================= */

                            const title =
                                row[
                                    "Transaction Details"
                                ]?.trim() ||
                                row[
                                    "Other Transaction Party"
                                ]?.trim() ||
                                row["Description"]?.trim() ||
                                row["description"]?.trim() ||
                                row["merchant"]?.trim() ||
                                "Unknown Transaction";

                            const rawAmount =
                                row["Amount"] ||
                                row["amount"] ||
                                row["debit"] ||
                                0;

                            const amount =
                                parseAmount(rawAmount);

                            const rawDate =
                                row["Date"] ||
                                row["date"] ||
                                "";

                            const formattedDate =
                                formatDate(rawDate);

                            const category =
                                detectCategory(title);

                            const source = "Paytm CSV";

                            /* =========================
                               SKIP INVALID & CREDIT ROWS
                            ========================= */
                            const titleLower = title.toLowerCase();
                            const isCredit = 
                                titleLower.includes("received") || 
                                titleLower.includes("refund") || 
                                titleLower.includes("cashback") || 
                                titleLower.includes("credit") || 
                                titleLower.includes("cash deposit") ||
                                titleLower.includes("added");

                            if (!amount || amount <= 0 || isCredit) {
                                continue;
                            }

                            /* =========================
                               FUZZY DUPLICATE DETECTION
                            ========================= */
                            // Normalize the title: strip prefixes and retain alphanumeric text
                            const cleanTitle = title
                                .toLowerCase()
                                .replace(/paid to|money sent to|transfer to/g, "")
                                .replace(/[^a-z0-9]/g, "")
                                .trim();

                            const [existing] = await db.query(
                                `SELECT id, title FROM expenses 
                                 WHERE user_id = ? AND amount = ? AND date = ?`,
                                [userId, amount, formattedDate]
                            );

                            // Find if any existing transaction has a matching normalized title
                            const isDuplicate = existing.some(ext => {
                                const extClean = ext.title
                                    .toLowerCase()
                                    .replace(/paid to|money sent to|transfer to/g, "")
                                    .replace(/[^a-z0-9]/g, "")
                                    .trim();
                                return extClean === cleanTitle;
                            });

                            if (isDuplicate) {
                                continue;
                            }

                            /* =========================
                               INSERT INTO MYSQL
                            ========================= */

                            await db.query(
                                `
                                INSERT INTO expenses
                                (
                                  user_id,
                                  title,
                                  category,
                                  amount,
                                  date,
                                  source
                                )
                                VALUES (?, ?, ?, ?, ?, ?)
                                `,
                                [
                                    userId,
                                    title,
                                    category,
                                    amount,
                                    formattedDate,
                                    source,
                                ]
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
                            "CSV PROCESS ERROR:",
                            err
                        );

                        return res.status(500).json({
                            error:
                                "CSV processing failed",
                        });
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

            let importedCount = 0;

            for (const line of lines) {
                const lower =
                    line.toLowerCase();

                /* BASIC DETECTION */
                if (
                    lower.includes("paid") ||
                    lower.includes("debit") ||
                    lower.includes("sent") ||
                    lower.includes("transaction")
                ) {
                    /* EXTRACT AMOUNT */
                    const amountMatch =
                        line.match(
                            /-?\d+(\.\d{1,2})?/
                        );

                    const amount = amountMatch
                        ? Math.abs(
                            parseFloat(
                                amountMatch[0]
                            )
                        )
                        : 0;

                    /* =========================
                       SKIP INVALID & CREDIT ROWS
                    ========================= */
                    const titleLower = title.toLowerCase();
                    const isCredit = 
                        titleLower.includes("received") || 
                        titleLower.includes("refund") || 
                        titleLower.includes("cashback") || 
                        titleLower.includes("credit") || 
                        titleLower.includes("cash deposit") ||
                        titleLower.includes("added");

                    if (!amount || amount <= 0 || isCredit) {
                        continue;
                    }

                    /* =========================
                       FUZZY DUPLICATE DETECTION
                    ========================= */
                    const cleanTitle = title
                        .toLowerCase()
                        .replace(/paid to|money sent to|transfer to/g, "")
                        .replace(/[^a-z0-9]/g, "")
                        .trim();

                    const [existing] = await db.query(
                        `SELECT id, title FROM expenses 
                         WHERE user_id = ? AND amount = ? AND date = ?`,
                        [userId, amount, date]
                    );

                    const isDuplicate = existing.some(ext => {
                        const extClean = ext.title
                            .toLowerCase()
                            .replace(/paid to|money sent to|transfer to/g, "")
                            .replace(/[^a-z0-9]/g, "")
                            .trim();
                        return extClean === cleanTitle;
                    });

                    if (isDuplicate) {
                        continue;
                    }

                    /* =========================
                       INSERT INTO MYSQL
                    ========================= */

                    await db.query(
                        `
            INSERT INTO expenses
            (
              user_id,
              title,
              category,
              amount,
              date,
              source
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
                        [
                            userId,
                            title,
                            category,
                            amount,
                            date,
                            "PDF Statement",
                        ]
                    );

                    importedCount++;
                }
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