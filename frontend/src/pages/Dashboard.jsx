import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";

import {
  WRAPPER,
  ADD_BUTTON,
  STAT_CARD,
  VALUE_CLASS,
  ICON_WRAPPER,
  STATS_GRID,
  LABEL_CLASS,
  FILTER_WRAPPER,
  FILTER_LABELS,
  SELECT_CLASSES,
  FILTER_OPTIONS,
  EMPTY_STATE
} from "../assets/dummy";

import {
  HomeIcon,
  Plus,
  Filter,
  CalendarIcon,
  Flame
} from "lucide-react";

import { useOutletContext } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";

const API_BASE = "http://localhost:4000/api/tasks";

const Dashboard = () => {

  const outletContext = useOutletContext() || {};

  const {
    tasks = [],
    refreshTasks
  } = outletContext;

  const [showModal, setShowModal] = useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [filter, setFilter] =
    useState("all");

  // STATS
  const stats = useMemo(() => ({

    total: tasks.length,

    lowPriority: tasks.filter(
      t =>
        String(t.priority)
          .trim()
          .toLowerCase() === "low"
    ).length,

    mediumPriority: tasks.filter(
      t =>
        String(t.priority)
          .trim()
          .toLowerCase() === "medium"
    ).length,

    highPriority: tasks.filter(
      t =>
        String(t.priority)
          .trim()
          .toLowerCase() === "high"
    ).length

  }), [tasks]);

  // FILTER TASKS
  const filteredTasks = useMemo(() => {

    if (filter === "all") {
      return tasks;
    }

    if (
      filter === "low" ||
      filter === "medium" ||
      filter === "high"
    ) {

      return tasks.filter(task => {

        const priority =
          String(task.priority)
            .trim()
            .toLowerCase();

        return priority === filter;

      });

    }

    if (filter === "today") {

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      return tasks.filter(task => {

        if (!task.dueDate) return false;

        return (
          task.dueDate
            .split("T")[0] === today
        );

      });

    }

    if (filter === "week") {

      const today = new Date();

      const nextWeek = new Date();

      nextWeek.setDate(
        today.getDate() + 7
      );

      return tasks.filter(task => {

        if (!task.dueDate) return false;

        const taskDate =
          new Date(task.dueDate);

        return (
          taskDate >= today &&
          taskDate <= nextWeek
        );

      });

    }

    return tasks;

  }, [tasks, filter]);


  // DELETE TASK
  const handleDelete = async (id) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.delete(
        `${API_BASE}/${id}/gp`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      await refreshTasks();

    }

    catch(error){

      console.log(error);

    }

  };


  // COMPLETE TOGGLE
  const handleToggleComplete = async (
    id,
    completed
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.put(
        `${API_BASE}/${id}/gp`,
        {
          completed: !completed
        },
        {
          headers:{
            Authorization:
            `Bearer ${token}`
          }
        }
      );

      await refreshTasks();

    }

    catch(error){

      console.log(error);

    }

  };


  // SAVE TASK
  const handleTaskSave = useCallback(
    async taskData => {

      try {

        const token =
          localStorage.getItem("token");

        const headers = {
          Authorization:
            `Bearer ${token}`
        };

        const id =
          taskData._id ||
          taskData.id;

        if (id) {

          await axios.put(
            `${API_BASE}/${id}/gp`,
            taskData,
            { headers }
          );

        }

        else {

          await axios.post(
            `${API_BASE}/gp`,
            taskData,
            { headers }
          );

        }

        await refreshTasks();

        setShowModal(false);

        setSelectedTask(null);

      }

      catch(error){

        console.log(error);

      }

    },

    [refreshTasks]

  );


  return (

    <div className={WRAPPER}>

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold flex items-center gap-2">

            <HomeIcon className="w-6 h-6 text-purple-500"/>

            Task Overview

          </h1>

          <p className="text-gray-500">

            Manage your tasks efficiently

          </p>

        </div>

        <button
          onClick={() =>
            setShowModal(true)
          }
          className={ADD_BUTTON}
        >

          <Plus size={18}/>

          Add New Task

        </button>

      </div>

      {/* STATS */}

      <div className={`${STATS_GRID} mt-6`}>

        {[

          {
            key:"all",
            label:"Total Tasks",
            icon:HomeIcon,
            iconColor:"bg-purple-100 text-purple-600",
            valueKey:"total",
            gradient:true
          },

          {
            key:"low",
            label:"Low Priority",
            icon:Flame,
            iconColor:"bg-green-100 text-green-600",
            valueKey:"lowPriority",
            textColor:"text-green-600"
          },

          {
            key:"medium",
            label:"Medium Priority",
            icon:Flame,
            iconColor:"bg-orange-100 text-orange-600",
            valueKey:"mediumPriority",
            textColor:"text-orange-600"
          },

          {
            key:"high",
            label:"High Priority",
            icon:Flame,
            iconColor:"bg-red-100 text-red-600",
            valueKey:"highPriority",
            textColor:"text-red-600"
          }

        ].map(({
          key,
          label,
          icon:Icon,
          iconColor,
          valueKey,
          textColor,
          gradient
        }) => (

          <div
            key={key}
            onClick={() => setFilter(key)}
            className={`${STAT_CARD} cursor-pointer ${
              filter===key
              ? "ring-2 ring-purple-500"
              : ""
            }`}
          >

            <div className="flex items-center gap-3">

              <div className={ICON_WRAPPER}>
                <Icon className={`w-5 h-5 ${iconColor}`}/>
              </div>

              <div>

                <p className={`${VALUE_CLASS} ${
                  gradient
                  ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
                  : textColor
                }`}>
                  {stats[valueKey]}
                </p>

                <p className={LABEL_CLASS}>
                  {label}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* TASKS */}

      <div className="space-y-4 mt-4">

        {filteredTasks.map(task => (

          <TaskItem
            key={task._id}
            task={task}
            onRefresh={refreshTasks}
            showCompleteCheckbox

            onDelete={() =>
              handleDelete(task._id)
            }

            onToggleComplete={() =>
              handleToggleComplete(
                task._id,
                task.completed
              )
            }

            onEdit={()=>{
              setSelectedTask(task);
              setShowModal(true);
            }}
          />

        ))}

      </div>

      <TaskModal
        isOpen={
          showModal ||
          !!selectedTask
        }
        onClose={()=>{
          setShowModal(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />

    </div>

  );

};

export default Dashboard;