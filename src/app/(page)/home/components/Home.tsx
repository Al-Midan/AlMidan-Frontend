"use client";

import React, { useState, useEffect } from "react";
import { Meteors } from "@/components/ui/meteors";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
        console.log("Courses Response:", coursesRes);
        console.log("Jobs Response:", jobsRes);
        console.log("Skills Response:", skillsRes);
        setCourses(coursesRes.data.allCourse || []);
        setJobs(jobsRes.data.response || []);
        setSkills(skillsRes.data.response || []);

        setTimeout(() => setShowContent(true), 4000);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 opacity-20"></div>
      <Meteors number={60} />

      <AnimatePresence>
        {!showContent && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4 }}
            className="absolute inset-0 flex items-center justify-center bg-black z-50"
          >
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.5 }}
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
        transition={{ duration: 2.5 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl mt-20 font-bold mb-8 text-center">
          Explore Al-Midan
        </h1>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full ${
              filter === "all" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("courses")}
            className={`px-4 py-2 rounded-full ${
              filter === "courses" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setFilter("jobs")}
            className={`px-4 py-2 rounded-full ${
              filter === "jobs" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setFilter("skills")}
            className={`px-4 py-2 rounded-full ${
              filter === "skills" ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            Skills
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems().map((item: any) => (
            <motion.div
              key={item._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
            >
              <Link href={`/${item.type}/${item._id}`}>
                <Image
                  src={item.image || item.courseImage}
                  alt={item.title || item.courseName}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {item.title || item.courseName}
                  </h2>
                  <p className="text-gray-400 mb-4">
                    {item.description || item.courseDescription}
                  </p>
                  {item.type === "course" && (
                    <p className="text-green-400 font-bold">
                      ${item.coursePrice}
                    </p>
                  )}
                  {item.type === "job" && (
                    <p className="text-green-400 font-bold">
                      Budget: ${item.budget}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
