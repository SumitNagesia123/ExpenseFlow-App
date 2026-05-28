import api from "../api/api";

export const getDashboardData = () => {
  return api.get("/dashboard");
};
