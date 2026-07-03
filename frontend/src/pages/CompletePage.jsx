import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CT_CLASSES, SORT_OPTIONS } from '../assets/dummy';
import { CheckCircle2, Filter } from 'lucide-react';
import axios from 'axios';

import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';

const API_URL = import.meta.env.VITE_API_URL;

console.log("API URL:", API_URL);
const CompletePage = () => {
  const { tasks = [], refreshTasks } = useOutletContext();

  const [sortBy, setSortBy] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

     await axios.delete(
  `${API_URL}/api/tasks/${id}/gp`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const sortedCompletedTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        [true, 1, 'yes'].includes(
          typeof task.completed === 'string'
            ? task.completed.toLowerCase()
            : task.completed
        )
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);

          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);

          case 'priority':
            const priorityOrder = {
              high: 3,
              medium: 2,
              low: 1,
            };

            return (
              (priorityOrder[b.priority?.toLowerCase()] || 0) -
              (priorityOrder[a.priority?.toLowerCase()] || 0)
            );

          default:
            return 0;
        }
      });
  }, [tasks, sortBy]);

 
  const handleTaskSave = async (taskData) => {
    const token = localStorage.getItem("token");

    const id = taskData._id || taskData.id; // 🔥 FIX HERE

    if (!id) {
      console.error("Missing task ID:", taskData);
      return;
    }

    await axios.put(
      `${API_URL}/api/tasks/${id}/gp`,
      taskData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    await refreshTasks();
    setShowModal(false);
    setSelectedTask(null);
  };
  

  return (
    <div className={CT_CLASSES.page}>

      {/* HEADER */}
      <div className={CT_CLASSES.header}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="text-purple-500 w-6 h-6" />
            Completed Tasks
          </h1>

          <p className="text-sm text-gray-500 mt-1 ml-7">
            {sortedCompletedTasks.length} task
            {sortedCompletedTasks.length !== 1 && 's'} marked as completed
          </p>
        </div>

        {/* SORT */}
        <div className="flex mt-4 md:mt-0 w-full md:justify-end">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border w-full md:w-auto">

            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-xs md:text-sm">Sort by:</span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

          </div>
        </div>
      </div>

      {/* TASKS */}
      <div className="mt-6 space-y-4">
        {sortedCompletedTasks.map((task) => (
          <TaskItem
            key={task._id || task.id}
            task={task}
            onDelete={() => handleDelete(task._id || task.id)}
            onEdit={() => {
              setSelectedTask(task);
              setShowModal(true);
            }}
            onRefresh={refreshTasks}
          />
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <TaskModal
          isOpen={showModal}
          taskToEdit={selectedTask}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          onSave={handleTaskSave}
        />
      )}

    </div>
  );
};

export default CompletePage;