import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  Home,
  CheckCircle,
  Clock,
  Lightbulb,
  Menu,
  X
} from 'lucide-react';

import {
  SIDEBAR_CLASSES,
  PRODUCTIVITY_CARD,
  TIP_CARD,
} from '../assets/dummy';

const Sidebar = ({ user, tasks }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Task calculations
  const totalTasks = tasks?.length || 0;

  const completedTasks =
    tasks?.filter((t) => t.completed)?.length || 0;

  const productivity =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  // User data
  const username = user?.name || 'User';
  const initial =
    username.charAt(0).toUpperCase();

  // Productivity Tips
  const tips = [
    "Break large tasks into smaller steps.",
    "Complete difficult tasks first.",
    "Take short breaks every hour.",
    "Prioritize what matters most.",
    "Small progress beats no progress."
  ];

  const randomTip =
    tips[Math.floor(Math.random() * tips.length)];

  // Lock body scroll when mobile sidebar opens
  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ? 'hidden' : 'auto';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileOpen]);

  // Navigation menu
  const menuItems = [
    {
      text: 'Dashboard',
      path: '/',
      icon: <Home className="w-5 h-5" />
    },
    {
      text: 'Completed',
      path: '/completed',
      icon: (
        <CheckCircle className="w-5 h-5" />
      )
    },
    {
      text: 'Pending',
      path: '/pending',
      icon: (
        <Clock className="w-5 h-5" />
      )
    }
  ];

  const LINK_CLASSES = {
    base:
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',

    active:
      'bg-purple-100 text-purple-700 font-medium',

    inActive:
      'text-gray-600 hover:bg-purple-50',

    icon: 'flex items-center'
  };

  const renderMenuItems = (
    isMobile = false
  ) => (
    <ul className="space-y-2">
      {menuItems.map(
        ({ text, path, icon }) => (
          <li key={text}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                [
                  LINK_CLASSES.base,

                  isActive
                    ? LINK_CLASSES.active
                    : LINK_CLASSES.inActive,

                  isMobile
                    ? 'justify-start'
                    : 'lg:justify-start'
                ].join(' ')
              }
              onClick={() =>
                setMobileOpen(false)
              }
            >
              <span
                className={
                  LINK_CLASSES.icon
                }
              >
                {icon}
              </span>

              <span>
                {text}
              </span>
            </NavLink>
          </li>
        )
      )}
    </ul>
  );

  return (
    <>
      {/* Desktop Sidebar */}

      <div className={SIDEBAR_CLASSES.desktop}>
        
        {/* User Section */}
        <div className="p-5 border-b border-purple-100 bg-white">
          <div className="flex items-center gap-3">

            <div
              className="
              w-10 h-10
              rounded-full
              bg-gradient-to-br
              from-fuchsia-500
              to-purple-600
              flex items-center
              justify-center
              text-white
              font-bold
              shadow-md"
            >
              {initial}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Hey, {username}
              </h2>

              <p
                className="
                text-sm
                text-purple-500
                font-medium
                flex items-center
                gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Let's crush some tasks!
              </p>
            </div>

          </div>
        </div>

        {/* Sidebar Content */}
        <div
          className="
          p-4
          space-y-6
          overflow-y-auto
          flex-1"
        >

          {/* Productivity Card */}
          <div className={PRODUCTIVITY_CARD.container}>

            <div className={PRODUCTIVITY_CARD.header}>
              <h3 className={PRODUCTIVITY_CARD.label}>
                PRODUCTIVITY
              </h3>

              <span className={PRODUCTIVITY_CARD.badge}>
                {productivity}%
              </span>
            </div>

            <div className={PRODUCTIVITY_CARD.barBg}>
              <div
                className={PRODUCTIVITY_CARD.barFg}
                style={{
                  width: `${productivity}%`
                }}
              />
            </div>

          </div>

          {renderMenuItems()}

          <div className="mt-auto pt-6 hidden lg:block">

            <div className={TIP_CARD.container}>
              <div className="flex items-center gap-2">

                <div className={TIP_CARD.iconWrapper}>
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>

                <div>
                  <h3 className={TIP_CARD.title}>
                    Pro Tip
                  </h3>

                  <p className={TIP_CARD.text}>
                    {randomTip}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className={SIDEBAR_CLASSES.mobileButton}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40">

          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className="fixed top-0 left-0 h-full w-72 bg-white shadow-xl p-5 z-50"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between items-center mb-4 border-b pb-2">

              <h2 className="text-lg font-bold text-purple-600">
                Menu
              </h2>

              <button
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* USER SECTION */}
            <div className="flex items-center gap-3 mb-6 mt-8">

              <div
                className="
                w-10 h-10
                rounded-full
                bg-gradient-to-br
                from-fuchsia-500
                to-purple-600
                flex items-center
                justify-center
                text-white
                font-bold
                shadow-md"
              >
                {initial}
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Hey, {username}
                </h2>

                <p className="text-sm text-purple-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3"/>
                  Let's crush some tasks!
                </p>
              </div>

            </div>

            {renderMenuItems(true)}

          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;