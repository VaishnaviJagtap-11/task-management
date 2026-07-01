import React, {
  useState,
  useCallback,
  useEffect,
  useMemo
} from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import axios from "axios";

import {
  TrendingUp,
  Circle,
  Zap,
  Clock
} from "lucide-react";

import { format } from "date-fns";

const Layout = ({ user, onLogout }) => {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      const token =
        localStorage.getItem("token");

      if (!token) {
        onLogout?.();
        return;
      }

      const { data } = await axios.get(
        "http://localhost:4000/api/tasks/gp",
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const arr =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.tasks)
          ? data.tasks
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setTasks(arr);

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not load tasks"
      );

      if (
        err.response?.status === 401
      ) {
        onLogout?.();
      }

    } finally {

      setLoading(false);

    }

  }, [onLogout]);

  useEffect(() => {

    fetchTasks();

  }, [fetchTasks]);


  // TASK STATS

  const stats = useMemo(() => {

    const completedCount =
      tasks.filter(
        t =>
          t.completed === true ||
          t.completed === 1 ||
          (
            typeof t.completed ===
            "string" &&
            t.completed.toLowerCase() ===
            "yes"
          )
      ).length;

    const totalCount =
      tasks.length;

    const pendingCount =
      totalCount -
      completedCount;

    const completionPercentage =
      totalCount
        ? Math.round(
            (
              completedCount /
              totalCount
            ) * 100
          )
        : 0;

    return {

      totalCount,
      completedCount,
      pendingCount,
      completionPercentage

    };

  }, [tasks]);


  // RECENT TASKS (latest 5 )

  const recentTasks = useMemo(() => {

    return [...tasks]

      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )

      .slice(0, 5);

  }, [tasks]);


  const StatCard = ({
    title,
    value,
    icon
  }) => (

    <div className="p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all">

      <div className="flex items-center gap-3">

        <div className="p-2 rounded-lg bg-purple-50">

          {icon}

        </div>

        <div>

          <p className="text-lg font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">

            {value}

          </p>

          <p className="text-xs text-gray-500">

            {title}

          </p>

        </div>

      </div>

    </div>

  );


  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"/>

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar
        user={user}
        onLogout={onLogout}
      />

      <Sidebar
        user={user}
        tasks={tasks}
      />

      <div className="ml-0 xl:ml-64 lg:ml-64 pt-16 p-4">

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT SIDE */}

          <div className="xl:col-span-2">

            <Outlet
              context={{
                tasks,
                refreshTasks: fetchTasks
              }}
            />

          </div>


          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* TASK STATISTICS */}

            <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100">

              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">

                <TrendingUp className="w-5 h-5 text-purple-500"/>

                Task Statistics

              </h3>

              <div className="grid grid-cols-2 gap-4">

                <StatCard
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={
                    <Circle className="w-4 h-4 text-green-500"/>
                  }
                />

                <StatCard
                  title="Completed"
                  value={stats.completedCount}
                  icon={
                    <Circle className="w-4 h-4 text-cyan-500"/>
                  }
                />

                <StatCard
                  title="Pending"
                  value={stats.pendingCount}
                  icon={
                    <Zap className="w-4 h-4 text-purple-500"/>
                  }
                />

                <StatCard
                  title="Completion Rate"
                  value={`${stats.completionPercentage}%`}
                  icon={
                    <Circle className="w-4 h-4 text-fuchsia-500"/>
                  }
                />

              </div>

              <div className="mt-5">

                <div className="flex justify-between text-sm">

                  <span>

                    Task Progress

                  </span>

                  <span>

                    {stats.completedCount}/
                    {stats.totalCount}

                  </span>

                </div>

                <div className="mt-2 h-2 rounded-full bg-purple-100 overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600"
                    style={{
                      width:
                        `${stats.completionPercentage}%`
                    }}
                  />

                </div>

              </div>

            </div>


            {/* RECENT ACTIVITY */}

            <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100">

              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">

                <Clock className="w-5 h-5 text-purple-500"/>

                Recent Activity

              </h3>

              {recentTasks.length === 0 ? (

                <p className="text-sm text-gray-500">

                  No recent activity

                </p>

              ) : (

                <div className="space-y-4">

                  {recentTasks.map(task => (

                    <div
                      key={task._id}
                      className="flex justify-between items-center border-b border-gray-100 pb-3"
                    >

                      <div>

                        <p className="font-medium text-gray-800">

                          {task.title}

                        </p>

                        <p className="text-xs text-gray-500">

                          {
                            task.createdAt
                              ? format(
                                  new Date(
                                    task.createdAt
                                  ),
                                  "MMM dd, yyyy"
                                )
                              : "No date"
                          }

                        </p>

                      </div>

                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs
                          ${
                            task.completed
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                          }
                        `}
                      >

                        {
                          task.completed
                          ? "Completed"
                          : "Pending"
                        }

                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};

export default Layout;