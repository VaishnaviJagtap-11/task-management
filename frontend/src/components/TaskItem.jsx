import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  MENU_OPTIONS,
  TI_CLASSES,
  getPriorityBadgeColor
} from "../assets/dummy";

import {
  CheckCircle2,
  MoreVertical,
  Calendar,
  Clock
} from "lucide-react";

import {
  isToday,
  format
} from "date-fns";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/tasks`;

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  onEdit,
  showCompleteCheckbox = true
}) => {

  const [showMenu, setShowMenu] = useState(false);

  const [isCompleted, setIsCompleted] = useState(
    task.completed === true ||
    task.completed === 1 ||
    (
      typeof task.completed === "string" &&
      task.completed.toLowerCase() === "yes"
    )
  );

  const [subtasks] = useState(
    task.subtasks || []
  );

  useEffect(() => {

    setIsCompleted(
      task.completed === true ||
      task.completed === 1 ||
      (
        typeof task.completed === "string" &&
        task.completed.toLowerCase() === "yes"
      )
    );

  }, [task.completed]);

  const getAuthHeaders = () => {

    const token = localStorage.getItem("token");

    if (!token) {
      onLogout?.();
      throw new Error("No auth token");
    }

    return {
      Authorization: `Bearer ${token}`
    };

  };

  const handleComplete = async () => {

    try {

      const taskId =
        task._id || task.id;

      const newStatus =
        isCompleted ? "No" : "Yes";

      await axios.put(
        `${API_BASE}/${taskId}`,
        {
          completed: newStatus
        },
        {
          headers: getAuthHeaders()
        }
      );

      setIsCompleted(!isCompleted);

      await onRefresh?.();

    } catch (err) {

      console.error(
        "Error updating task:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        onLogout?.();
      }

    }

  };

  const handleDelete = async () => {

    try {

      const taskId =
        task._id || task.id;

      await axios.delete(
        `${API_BASE}/${taskId}/gp`,
        {
          headers: getAuthHeaders()
        }
      );

      await onRefresh?.();

    } catch (err) {

      console.error(
        "Delete error:",
        err
      );

    }

  };

  const handleAction = (action) => {

    setShowMenu(false);

    switch (action) {

      case "edit":
        onEdit?.(task);
        break;

      case "delete":
        handleDelete();
        break;

      default:
        break;

    }

  };

  // Border colors
  const borderColor = isCompleted
    ? "border-2 border-green-500 border-l-8"
    : {
        low: "border-2 border-green-400 border-l-8",
        medium: "border-2 border-orange-400 border-l-8",
        high: "border-2 border-red-500 border-l-8"
      }[
        task.priority?.toLowerCase()
      ] || "border-2 border-gray-300 border-l-8";

  const progress =
    subtasks.length > 0
      ? (
          subtasks.filter(
            st => st.completed
          ).length /
          subtasks.length
        ) * 100
      : 0;

  return (

    <div
      className={`
        p-4 sm:p-5
        rounded-xl
        shadow-sm
        bg-white
        hover:shadow-md
        transition-all
        duration-300
        ${borderColor}
      `}
    >

      <div className={TI_CLASSES.leftContainer}>

        {showCompleteCheckbox && (

          <button
            onClick={handleComplete}
            className={`
              ${TI_CLASSES.completeBtn}
              ${
                isCompleted
                  ? "text-green-500"
                  : "text-gray-300"
              }
            `}
          >

            <CheckCircle2
              size={18}
              className={`
                ${TI_CLASSES.checkboxIconBase}
                ${
                  isCompleted
                    ? "fill-green-500"
                    : ""
                }
              `}
            />

          </button>

        )}

        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2 flex-wrap">

            <h3
              className={`
                ${TI_CLASSES.titleBase}
                ${
                  isCompleted
                    ? "line-through text-gray-400"
                    : "text-gray-800"
                }
              `}
            >

              {task.title}

            </h3>

            <span
              className={`
                ${TI_CLASSES.priorityBadge}
                ${getPriorityBadgeColor(
                  task.priority
                )}
              `}
            >

              {task.priority}

            </span>

          </div>

          {task.description && (

            <p className={TI_CLASSES.description}>
              {task.description}
            </p>

          )}

          {subtasks.length > 0 && (

            <div className="mt-3">

              <div className="w-full h-2 bg-gray-200 rounded">

                <div
                  className="h-2 bg-purple-500 rounded"
                  style={{
                    width: `${progress}%`
                  }}
                />

              </div>

              <p className="text-xs mt-1 text-gray-500">

                {Math.round(progress)}%
                complete

              </p>

            </div>

          )}

        </div>

        <div className={TI_CLASSES.rightContainer}>

          {/* MENU */}

          <div className="relative">

            <button
              onClick={() =>
                setShowMenu(!showMenu)
              }
              className={TI_CLASSES.menuButton}
            >

              <MoreVertical
                className="w-5 h-5"
              />

            </button>

            {showMenu && (

              <div
                className={
                  TI_CLASSES.menuDropdown
                }
              >

                {MENU_OPTIONS.map(
                  (opt) => (

                    <button
                      key={opt.action}
                      onClick={() =>
                        handleAction(
                          opt.action
                        )
                      }
                      className="w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center gap-2"
                    >

                      {opt.icon}

                      {opt.label}

                    </button>

                  )
                )}

              </div>

            )}

          </div>

          {/* Due Date */}

          <div
            className={`
              ${TI_CLASSES.dateRow}
              ${
                task.dueDate &&
                isToday(
                  new Date(task.dueDate)
                )
                  ? "text-fuchsia-600"
                  : "text-gray-500"
              }
            `}
          >

            <Calendar className="w-3.5 h-3.5"/>

            {
              task.dueDate
                ? isToday(
                    new Date(
                      task.dueDate
                    )
                  )
                  ? "Today"
                  : format(
                      new Date(
                        task.dueDate
                      ),
                      "MMM dd"
                    )
                : "-"
            }

          </div>

          {/* Created Date */}

          <div className={TI_CLASSES.createdRow}>

            <Clock className="w-3.5 h-3.5"/>

            {
              task.createdAt
                ? `Created ${format(
                    new Date(
                      task.createdAt
                    ),
                    "MMM dd"
                  )}`
                : "No date"
            }

          </div>

        </div>

      </div>

    </div>

  );

};

export default TaskItem;