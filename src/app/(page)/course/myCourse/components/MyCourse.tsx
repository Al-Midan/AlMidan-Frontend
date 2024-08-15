"use client";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETCOURSEWITHID } from "@/shared/helpers/endpoints";
import { motion } from "framer-motion";

interface Course {
  courseCategory: string;
  courseDescription: string;
  courseImage: string;
  courseName: string;
  coursePrice: number;
  sections: any[];
  userId: string;
  username: string;
  __v: number;
  _id: string;
}

const MyCourse = () => {
  const [values, setValues] = useState<Course[]>([]);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;    
    const fetchData = async () => {
      if (!parsedUserData) {
        toast.error("User data not found", {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
        return;
      }
      const loadingToastId = toast.loading("Processing", {
        style: { background: "black", color: "white" },
        position: "top-center",
      });

      try {
        const response = await axiosInstance.get(GETCOURSEWITHID.replace(":id", parsedUserData._id));
        const Message = response.data.message;
        if (response.status === 200) {
          toast.dismiss(loadingToastId);
          const success = toast.success(Message, {
            style: { background: "black", color: "white" },
            position: "top-center",
          });
          setValues(response.data.response);
          setTimeout(() => {
            toast.dismiss(success);
          }, 1000);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.dismiss(loadingToastId);
          const errorMessage = error.response.data.message;
          toast.error(errorMessage, {
            style: { background: "black", color: "white" },
            position: "top-center",
          });
        } else {
          toast.dismiss(loadingToastId);
          console.error("Error fetching courses:", error);
          toast.error("Error fetching courses", {
            style: { background: "black", color: "white" },
            position: "top-center",
          });
        }
      }
    };

    fetchData();
  }, []);

  const handleEdit = (id: string) => {
    // Implement edit functionality
    console.log(`Editing course with id: ${id}`);
  };

  const handleDelete = (id: string) => {
    // Implement delete functionality
    console.log(`Deleting course with id: ${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Toaster />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          My Courses
        </h1>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={course.courseImage}
                  alt={course.courseName}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                    {course.courseCategory}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 text-white">
                  {course.courseName}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {course.courseDescription}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    ${course.coursePrice}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCourse;