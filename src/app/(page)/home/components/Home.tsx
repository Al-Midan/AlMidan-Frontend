"use client";

import React, { useState, useEffect } from "react";
import { Meteors } from "@/components/ui/meteors";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { RootState } from "@/redux/store";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETALLJOB, GETCOURSE, GETSKILLS } from "@/shared/helpers/endpoints";

interface Course {
  _id: string;
  courseName: string;
  courseDescription: string;
  courseImage: string;
  coursePrice: number;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  image: string;
  budget: number;
}

interface Skill {
  _id: string;
  title: string;
  description: string;
  image: string;
}

const HomePage = () => {
  const router = useRouter();
  const user = useAppSelector((state: RootState) => state.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filter, setFilter] = useState<"all" | "courses" | "jobs" | "skills">(
    "all"
  );
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, jobsRes, skillsRes] = await Promise.all([
          axiosInstance.get(GETCOURSE),
          axiosInstance.get(GETALLJOB),
          axiosInstance.get(GETSKILLS),
        ]);
        setCourses(coursesRes.data.allCourse || []);
        setJobs(jobsRes.data.response || []);
        setSkills(skillsRes.data.response || []);

        setTimeout(() => setShowContent(true), 5000);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredItems = () => {
    switch (filter) {
      case "courses":
        return courses.map((course) => ({ ...course, type: "course" }));
      case "jobs":
        return jobs.map((job) => ({ ...job, type: "job" }));
      case "skills":
        return skills.map((skill) => ({ ...skill, type: "skill" }));
      default:
        return [
          ...courses.map((course) => ({ ...course, type: "course" })),
          ...jobs.map((job) => ({ ...job, type: "job" })),
          ...skills.map((skill) => ({ ...skill, type: "skill" })),
        ];
    }
  };

  const handleCardClick = (item: any) => {
    console.log("Card clicked:", item);
    switch (item.type) {
      case "course":
        router.push(`/course/${item._id}`);
        break;
      case "job":
        router.push(`/service`);
        break;
      case "skill":
        router.push(`/service/skill`);
        break;
    }
  };

  const handleFilterClick = (
    newFilter: "all" | "courses" | "jobs" | "skills"
  ) => {
    console.log("Filter clicked:", newFilter);
    setFilter(newFilter);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black-100 text-white">
      <div className="absolute inset-0 opacity-20"></div>
      <Meteors number={60} />

      <AnimatePresence>
        {!showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: 3 }}
            className="absolute inset-0 flex items-center justify-center bg-black z-50"
          >
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2 }}
              className="text-4xl font-bold text-white text-center"
            >
              Welcome to Al-Midan, {user.username}!
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 2 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl mt-20 font-bold mb-8 text-center">
          Explore Al-Midan
        </h1>

        <div className="flex justify-center space-x-4 mb-8">
          {["all", "courses", "jobs", "skills"].map((f) => (
            <button
              key={f}
              onClick={() => {
                console.log("Button clicked:", f);
                handleFilterClick(f as "all" | "courses" | "jobs" | "skills");
              }}
              className={`px-4 py-2 rounded-full transition-colors duration-200 hover:bg-opacity-80 ${
                filter === f ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems().map((item: any) => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(item)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl hover:bg-gray-700"
            >
              <div className="w-full h-36 relative">
                <Image
                  src={item.image || item.courseImage}
                  alt={item.title || item.courseName}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-3">
                <h2 className="text-lg font-semibold mb-1">
                  {item.title || item.courseName}
                </h2>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                  {item.description || item.courseDescription}
                </p>
                {item.type === "course" && (
                  <p className="text-green-400 font-bold text-sm">
                    ${item.coursePrice}
                  </p>
                )}
                {item.type === "job" && (
                  <p className="text-green-400 font-bold text-sm">
                    Budget: ${item.budget}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
