import api from "../api/api";

export const getBudgetStatus = async () => {
  const response = await api.get("/budget/status");
  return response.data;
};