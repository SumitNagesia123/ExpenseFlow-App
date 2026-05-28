import api from "../api/api";

/* GET ALL EXPENSES */
export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};

/* ADD EXPENSE */
export const addExpense = async (expenseData) => {
  const response = await api.post("/expenses", expenseData);
  return response.data;
};

/* DELETE EXPENSE */
export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};