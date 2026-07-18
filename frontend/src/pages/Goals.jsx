import { useEffect, useState } from "react";
import GoalCard from "../components/goals/GoalCard";
import AddGoalModal from "../components/goals/AddGoalModal";
import ConfirmModal from "../components/common/ConfirmModal";
import { getGoals, createGoal, addMoneyToGoal, deleteGoal } from "../services/goalService";
import { toast } from "react-hot-toast";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchAllGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data || []);
    } catch (err) {
      console.error("Load goals error:", err);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllGoals();
  }, []);

  const handleAddGoal = async (newGoalData) => {
    try {
      const created = await createGoal({
        name: newGoalData.name,
        target_amount: newGoalData.target_amount,
        deadline: newGoalData.deadline || null
      });
      setGoals((prev) => [created, ...prev]);
      setShowModal(false);
      toast.success("Goal created successfully!");
    } catch (err) {
      console.error("Create goal error:", err);
      toast.error("Failed to create goal");
    }
  };

  const handleAddMoney = async (id, amount) => {
    try {
      const result = await addMoneyToGoal(id, amount);
      setGoals((prev) =>
        prev.map((g) =>
          g.id === id
            ? { ...g, current_amount: result.current_amount, status: result.status }
            : g
        )
      );
      toast.success(`Successfully saved ₹${amount.toLocaleString()} to goal!`);
    } catch (err) {
      console.error("Add money error:", err);
      toast.error("Failed to save money to goal");
    }
  };

  const handleDeleteGoal = (id) => {
    setPendingDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGoal = async () => {
    const id = pendingDeleteId;
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal deleted successfully");
    } catch (err) {
      console.error("Delete goal error:", err);
      toast.error("Failed to delete goal");
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-sm text-gray-400 font-medium">Loading goals…</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Savings Goals</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Create, track, and fund savings goals live from your account balance
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Add Goal
        </button>
      </div>

      {/* ACTIVE GOALS */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Active Goals</h2>

        {activeGoals.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No active goals. Click + Add Goal to get started!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onAddMoney={handleAddMoney}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED GOALS */}
      <section>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Completed Goals</h2>

        {completedGoals.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No completed goals yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onAddMoney={handleAddMoney}
              />
            ))}
          </div>
        )}
      </section>

      {/* MODAL */}
      {showModal && (
        <AddGoalModal
          onClose={() => setShowModal(false)}
          onAddGoal={handleAddGoal}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Savings Goal"
        message="Are you sure you want to delete this savings goal? This action cannot be undone."
        onConfirm={confirmDeleteGoal}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
