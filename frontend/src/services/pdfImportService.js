import api from "./api";

export const importPDF = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/import/pdf",
        formData,
        {
            headers: {
                "Content-Type":
                    "multipart/form-data",
            },
        }
    );

    return response.data;
};