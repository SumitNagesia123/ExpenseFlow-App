import api from "../api/api";

/* =========================
   CSV IMPORT
========================= */
export const importCSV = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/import/csv",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

/* =========================
   DELETE ALL CSV IMPORTS
========================= */
export const deleteCSVImports = async () => {
    const response = await api.delete("/expenses/imported/csv");
    return response.data;
};

/* =========================
   DELETE ALL PDF IMPORTS
========================= */
export const deletePDFImports = async () => {
    const response = await api.delete("/expenses/imported/pdf");
    return response.data;
};