// coursePage.tsx
"use client";

import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETCOURSE } from "@/shared/helpers/endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { CardDemo } from "./components/BackgroundOverlayCard";

// Define an interface for the course structure
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

const Page = () => {
  const [values, setValues] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const loadingToastId = toast.loading("Processing", {
        style: { background: "black", color: "white" },
        position: "top-center",
      });

      try {
        const response = await axiosInstance.get(GETCOURSE);
        const Message = response.data.message;
        if (response.status === 200) {
          console.log("response", response);
          toast.dismiss(loadingToastId);
          toast.success(Message, {
            style: { background: "black", color: "white" },
            position: "top-center",
          });
          setValues(response.data.allCourse);
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

  return (
    <div className="bg-black-100 min-h-screen flex flex-col items-center p-10 pt-14">
      <Toaster />
      <h1 className="text-center text-4xl mt-16 font-bold">Courses</h1>
      <br />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {values.map((course) => (
          <CardDemo
            key={course._id}
            imageUrl={course.courseImage}
            heading={course.courseName}
            description={course.courseDescription}
            courseId={course._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
