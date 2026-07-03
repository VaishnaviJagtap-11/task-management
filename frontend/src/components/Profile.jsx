import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import {
  ChevronLeft,
  UserCircle,
  Save,
  User,
  Mail,
  Shield,
  Lock,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  BACK_BUTTON,
  INPUT_WRAPPER,
  SECTION_WRAPPER,
  FULL_BUTTON
} from '../assets/dummy';

const API_URL = import.meta.env.VITE_API_URL;

const DANGER_BTN =
  "w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition";

const Profile = ({ setCurrentUser, onLogout }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const personalFields = [
    {
      name: "name",
      type: "text",
      placeholder: "Full Name",
      icon: User
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email Address",
      icon: Mail
    }
  ];

  const securityFields = [
    {
      name: "current",
      placeholder: "Current Password"
    },
    {
      name: "new",
      placeholder: "New Password"
    },
    {
      name: "confirm",
      placeholder: "Confirm Password"
    }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) return;

    axios
      .get(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(({ data }) => {
        if (data.success) {
          setProfile({
            name: data.user.name,
            email: data.user.email
          });
        } else {
          toast.error(data.message);
        }
      })
      .catch(() => {
        toast.error("Unable to load profile");
      });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        {
          name: profile.name,
          email: profile.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`
        }));

        toast.success("Profile updated successfully");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Profile update failed"
      );
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords do not match");
    }

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        toast.success("Password changed successfully");

        setPasswords({
          current: "",
          new: "",
          confirm: ""
        });
      } else {
        toast.error(data.message);
      }

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Password change failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-center"
        autoClose={3000}
      />

      <div className="max-w-4xl mx-auto p-6">

        <button
          onClick={() => navigate(-1)}
          className={BACK_BUTTON}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-8 mt-6">

          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {profile.name
              ? profile.name[0].toUpperCase()
              : "U"}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Account Settings
            </h1>

            <p className="text-gray-500 text-sm">
              Manage your profile and security settings
            </p>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Personal Information */}
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <UserCircle className="w-5 h-5 text-purple-500" />

              <h2 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>

            <form
              onSubmit={saveProfile}
              className="space-y-4"
            >
              {personalFields.map(
                ({ name, type, placeholder, icon: Icon }) => (
                  <div
                    key={name}
                    className={INPUT_WRAPPER}
                  >
                    <Icon className="w-5 h-5 mr-2 text-purple-500" />

                    <input
                      type={type}
                      placeholder={placeholder}
                      value={profile[name]}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          [name]: e.target.value
                        })
                      }
                      className="w-full bg-transparent focus:outline-none text-sm"
                      required
                    />
                  </div>
                )
              )}

              <button
                type="submit"
                className={FULL_BUTTON}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>

            </form>
          </section>

          {/* Security */}
          <section className={SECTION_WRAPPER}>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-purple-500" />

              <h2 className="text-xl font-semibold text-gray-800">
                Security
              </h2>
            </div>

            <form
              onSubmit={changePassword}
              className="space-y-4"
            >
              {securityFields.map(
                ({ name, placeholder }) => (
                  <div
                    key={name}
                    className={INPUT_WRAPPER}
                  >
                    <Lock className="w-5 h-5 mr-2 text-purple-500" />

                    <input
                      type="password"
                      placeholder={placeholder}
                      value={passwords[name]}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          [name]: e.target.value
                        })
                      }
                      className="w-full bg-transparent focus:outline-none text-sm"
                      required
                    />
                  </div>
                )
              )}

              <button
                type="submit"
                className={FULL_BUTTON}
              >
                <Shield className="w-4 h-4" />
                Change Password
              </button>

              <div className="mt-8 pt-6 border-t border-purple-100">
                <h3 className="text-red-600 font-semibold mb-4 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Danger Zone
                </h3>

                <button
                  type="button"
                  className={DANGER_BTN}
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>

              </div>

            </form>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Profile;