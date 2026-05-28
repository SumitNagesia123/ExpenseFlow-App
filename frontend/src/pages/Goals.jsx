import { useState } from "react";

import GoalCard from "../components/goals/GoalCard";
import AddGoalModal from "../components/goals/AddGoalModal";

import goalsMock from "../data/goalsMock";

export default function Goals() {
  const [goals, setGoals] = useState(goalsMock);
  const [showModal, setShowModal] = useState(false);

  const activeGoals = goals.filter(g => g.status === "active");
  const completedGoals = goals.filter(g => g.status === "completed");

  const handleAddGoal = (newGoal) => {
    setGoals(prev => [
      ...prev,
      {
        ...newGoal,
        id: Date.now(),
        saved: 0,
        status: "active",
      },
    ]);
    setShowModal(false);
  };

  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Goals</h1>

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
          <p className="text-gray-500 dark:text-slate-400">No active goals</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
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
            {completedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
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
    </div>
  );
}
