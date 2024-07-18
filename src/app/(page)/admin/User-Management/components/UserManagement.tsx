"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

interface User {
  _id: string;
  username: string;
  email: string;
  isBlocked: boolean;
  isVerified: boolean;
  roles: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });

    const fetchData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (!userData) {
          throw new Error("User data not found in local storage");
        }
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await axios.get(
          "http://localhost:5000/user-service/user-management",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "x-refresh-token": refreshToken,
            },
          }
        );

        console.log("response", response);
        toast.dismiss(loadingToastId);
        const filteredUsers = response.data.users.filter(
          (user: User) => !user.roles.includes("admin")
        );
        setUsers(filteredUsers);
        const success = toast.success(response.data.message, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
        setTimeout(() => {
          toast.dismiss(success);
        }, 1000);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.dismiss(loadingToastId);
        toast.error("Failed to fetch data", {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      }
    };

    fetchData();
  }, []);

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      const loadingToastId = toast.loading("Processing", {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      const response = await axios.put(
        `http://localhost:5000/user-service/isBlocked/${userId}`
      );
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, isBlocked: !currentStatus } : user
        )
      );
      toast.dismiss(loadingToastId);
      toast.success(response.data.message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status", {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
    }
  };

  return (
    <div className="font-sans text-white bg-black-100 min-h-screen">
      <div className=" justify-between items-center p-4 bg-black-100">
        <h1 className="text-2xl font-bold">AL-Midan</h1>
        <h2 className="text-3xl font-semibold text-center mt-20">
          User Management
        </h2>
      </div>
      <Toaster />
      <div className="overflow-x-auto p-4 flex justify-center">
        <table className="w-9/12 bg-violet-950 text-white rounded-lg">
          <thead>
            <tr>
              <th className="p-4 text-left text-sm font-semibold">Username</th>
              <th className="p-4 text-left text-sm font-semibold  white-space-nowrap">
                Email
              </th>
              <th className="p-4 text-left text-sm font-semibold">IsBlocked</th>
              <th className="p-4 text-left text-sm font-semibold">
                IsVerified
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="p-4 py-2 text-sm">{user.username}</td>
                <td className="p-4 py-2  text-sm">{user.email}</td>
                <td className="p-4 py-3">
                  <label className="relative cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={user.isBlocked}
                      onChange={() =>
                        handleToggleBlock(user._id, user.isBlocked)
                      }
                    />
                    <div
                      className={`w-11 h-6 flex items-center rounded-full after:absolute after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${
                        user.isBlocked
                          ? "bg-red-500 peer-checked:after:translate-x-full"
                          : "bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white"
                      }`}
                    ></div>
                  </label>
                </td>
                <td className="p-4 py-2  text-sm">
                  {user.isVerified ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
