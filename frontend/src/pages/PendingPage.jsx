import React, { useState, useMemo, useCallback } from 'react';
import { layoutClasses, SORT_OPTIONS } from '../assets/dummy';
import {
  ListChecks,
  Filter,
} from 'lucide-react';

import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import TaskModal from '../components/TaskModal';

const API_BASE = "http://localhost:4000/api/tasks";

const PendingPage = () => {

  const { tasks = [], refreshTasks } = useOutletContext();

  const [sortBy, setSortBy] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_BASE}/${id}/gp`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/${id}/gp`,
        {
          completed: !completed
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      refreshTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const sortedPendingTasks = useMemo(() => {
    const filtered = tasks.filter((task) =>
      task.completed === false ||
      task.completed === undefined ||
      (typeof task.completed === 'string' &&
        task.completed.toLowerCase() === 'no')
    );

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }

      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }

      const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1,
      };

      return (
        (priorityOrder[b.priority?.toLowerCase()] || 0) -
        (priorityOrder[a.priority?.toLowerCase()] || 0)
      );
    });
  }, [tasks, sortBy]);

  
  const handleTaskSave = async (taskData) => {

    const token = localStorage.getItem("token");

    const id = taskData._id || taskData.id;

    if (!id) {
      console.error("Missing task id", taskData);
      return;
    }

    await axios.put(
      `${API_BASE}/${id}/gp`,
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
    <div className={layoutClasses.container}>

      {/* HEADER */}
      <div className={layoutClasses.headerWrapper}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="text-purple-500" />
            Pending Tasks
          </h1>

          <p className="text-sm text-gray-500 mt-1 ml-7">
            {sortedPendingTasks.length} tasks needing your attention
          </p>
        </div>

        {/* SORT */}
        <div className="flex mt-4 md:mt-0 w-full md:justify-end">

          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border"> Sort by

            <Filter className="w-4 h-4 text-purple-500" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
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

      {/* TASK LIST */}
      <div className="space-y-4">
        {sortedPendingTasks.map((task) => (
          <TaskItem
            key={task._id || task.id}
            task={task}
            showCompleteCheckbox={true}
            onDelete={() => handleDelete(task._id || task.id)}
            onToggleComplete={() =>
              handleToggleComplete(task._id || task.id, task.completed)
            }
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
          onSave={handleTaskSave}   // 🔥 FIXED
        />
      )}

    </div>
  );
};

export default PendingPage;