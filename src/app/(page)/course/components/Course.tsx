"use client";

import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETCOURSE } from "@/shared/helpers/endpoints";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { CardDemo } from "./BackgroundOverlayCard";
import { useRouter } from "next/navigation";

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

const Course = () => {
  const [values, setValues] = useState<Course[]>([]);
  const [filteredValues, setFilteredValues] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [filterCategory, setFilterCategory] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const loadingToastId = toast.loading("Processing", {
        style: { background: "#0f172a", color: "#38bdf8" },
        position: "top-center",
      });

      try {
        const response = await axiosInstance.get(GETCOURSE);
        const Message = response.data.message;
        if (response.status === 200) {
          toast.dismiss(loadingToastId);
          const success = toast.success(Message, {
            style: { background: "#0f172a", color: "#38bdf8" },
            position: "top-center",
          });
          setValues(response.data.allCourse);
          setFilteredValues(response.data.allCourse);
          setTimeout(() => {
            toast.dismiss(success);
          }, 1000);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          toast.dismiss(loadingToastId);
          const errorMessage = error.response.data.message;
          toast.error(errorMessage, {
            style: { background: "#0f172a", color: "#38bdf8" },
            position: "top-center",
          });
        } else {
          toast.dismiss(loadingToastId);
          console.error("Error fetching courses:", error);
          toast.error("Error fetching courses", {
            style: { background: "#0f172a", color: "#38bdf8" },
            position: "top-center",
          });
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...values];

    if (filterCategory !== "all") {
      result = result.filter(course => course.courseCategory === filterCategory);
    }

    if (searchTerm) {
      result = result.filter(course =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.courseName.localeCompare(b.courseName);
        case "name-desc":
          return b.courseName.localeCompare(a.courseName);
        case "price-asc":
          return a.coursePrice - b.coursePrice;
        case "price-desc":
          return b.coursePrice - a.coursePrice;
        default:
          return 0;
      }
    });

    setFilteredValues(result);
  }, [values, searchTerm, sortOption, filterCategory]);

  const categories = Array.from(new Set(values.map(course => course.courseCategory)));

  return (
    <div className="bg-[#020617] min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-10 pt-14 relative">
      <Toaster />
      <button
        onClick={() => router.push("/course/myCourse")}
        className="absolute top-4 right-4 bg-[#0f172a] text-[#38bdf8] font-bold py-2 px-4 rounded-full shadow-lg hover:bg-[#1e293b] transition-colors duration-300 flex items-center"
      >
        <span className="text-sm">My Courses</span>
      </button>
      <h1 className="text-center text-4xl mt-16 font-bold text-[#38bdf8]">Courses</h1>
      <div className="w-full max-w-4xl mt-8 mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 rounded bg-[#0f172a] text-[#38bdf8] border border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full sm:w-48 p-2 rounded bg-[#0f172a] text-[#38bdf8] border border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-48 p-2 rounded bg-[#0f172a] text-[#38bdf8] border border-[#38bdf8] focus:outline-none focus:ring-2 focus:ring-[#38bdf8]"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredValues.map((course) => (
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

export default Course;