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
    <div className="min-h-screen bg-black text-white">
      <Toaster />
      <nav className="bg-gray-900 p-4 sticky top-0 z-10">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">My Courses</h1>
        </div>
      </nav>
      <div className="container mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={course.courseImage}
                alt={course.courseName}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {course.courseName}
                </h2>
                <p className="text-gray-400 mb-4">{course.courseDescription}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-bold">
                    ${course.coursePrice}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEdit(course._id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors duration-200"
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
