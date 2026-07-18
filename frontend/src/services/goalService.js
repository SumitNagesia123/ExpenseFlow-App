import api from "../api/api";

export const getGoals = async () => {
  const res = await api.get("/goals");
  return res.data;
};

export const createGoal = async (newGoal) => {
  const res = await api.post("/goals", newGoal);
  return res.data;
};

export const addMoneyToGoal = async (id, amount) => {
  const res = await api.put(`/goals/${id}/add-money`, { amount });
  return res.data;
};

export const deleteGoal = async (id) => {
  const res = await api.delete(`/goals/${id}`);
  return res.data;
};
