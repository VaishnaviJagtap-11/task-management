import React, { useCallback, useEffect, useState } from 'react';
import { baseControlClasses, DEFAULT_TASK } from '../assets/dummy';

import {
  X,
  Save,
  PlusCircle,
  Calendar,
  AlignLeft,
  Flag,
  CheckCircle
} from 'lucide-react';

const priorityStyles = {
  Low: 'text-green-600',
  Medium: 'text-yellow-600',
  High: 'text-red-600',
};

const TaskModal = ({
  isOpen,
  onClose,
  taskToEdit,
  onSave,
}) => {

  const [taskData, setTaskData] = useState({
    ...DEFAULT_TASK,
    completed: 'No',
    priority: 'Low',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  //  LOAD TASK AFTER EDITING
  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      const normalized =
        taskToEdit.completed === 'Yes' ||
        taskToEdit.completed === true
          ? 'Yes'
          : 'No';

      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'Low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        completed: normalized,
        _id: taskToEdit._id || taskToEdit.id,   
      });

    } else {
      setTaskData({
        ...DEFAULT_TASK,
        completed: 'No',
        priority: 'Low',
      });
    }

    setError(null);
  }, [isOpen, taskToEdit]);

  // INPUT CHANGE
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setTaskData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // SUBMIT
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (taskData.dueDate && taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(taskData); 
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }

  }, [taskData, today, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">

      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">

            {taskData._id ? (
              <>
                <Save className="text-purple-500 w-5 h-5" />
                Edit Task
              </>
            ) : (
              <>
                <PlusCircle className="text-purple-500 w-5 h-5" />
                Create New Task
              </>
            )}

          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg text-gray-500 hover:text-purple-700"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* TITLE */}
          <input
            type="text"
            name="title"
            value={taskData.title}
            onChange={handleChange}
            placeholder="Task Title"
            className={baseControlClasses}
            required
          />

          {/* DESCRIPTION */}
          <textarea
            rows="3"
            name="description"
            value={taskData.description}
            onChange={handleChange}
            placeholder="Description"
            className={baseControlClasses}
          />

          {/* PRIORITY */}
          <select
            name="priority"
            value={taskData.priority}
            onChange={handleChange}
            className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* DATE */}
<div className="relative">
  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 z-10" />
          <input
            type="date"
            name="dueDate"
            value={taskData.dueDate}
            min={today}
            onChange={handleChange}
             className={`${baseControlClasses} pl-12 pr-4`}
          />
          </div>

          {/* STATUS */}
          <div className="flex gap-4 items-center">

            {[
              { val: 'Yes', label: 'Completed' },
              { val: 'No', label: 'In Progress' }
            ].map(({ val, label }) => (
              <label key={val} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="completed"
                  value={val}
                  checked={taskData.completed === val}
                  onChange={handleChange}
                />
                <span className="ml-2">{label}</span>
              </label>
            ))}

          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Saving...'
            ) : taskData._id ? (
              <>
                <Save className="w-4 h-4" />
                Update Task
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Task
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default TaskModal;