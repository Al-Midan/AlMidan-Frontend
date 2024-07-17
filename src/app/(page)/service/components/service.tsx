"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETALLJOB } from "@/shared/helpers/endpoints";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: number;
  paymentType: "Fixed Price" | "Hourly";
  duration: string;
  username: string;
  email: string;
  experienceLevel: "Beginner" | "Intermediate" | "Expert";
  postedDate: string;
  deadline: string;
  status: "Open" | "Closed";
  image: string;
}

const Services: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      const userDataString = localStorage.getItem("userData");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserEmail(userData.email);
      }
      try {
        const response = await axiosInstance.get(GETALLJOB);
        setJobs(response.data.response);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center mt-20">
          Job Listings
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentJobs.map((job) => (
            <motion.div
              key={job._id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={job.image || ""}
                alt={job.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 flex-grow">
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-400 mb-4 text-sm">
                  {expandedJob === job._id
                    ? job.description
                    : `${job.description.substring(0, 100)}...`}
                </p>
                <button
                  onClick={() =>
                    setExpandedJob(expandedJob === job._id ? null : job._id)
                  }
                  className="text-purple-400 hover:underline mb-4 text-sm"
                >
                  {expandedJob === job._id ? "View Less" : "View More"}
                </button>
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-purple-600 text-xs font-semibold px-2 py-1 rounded">
                    {job.category}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {job.experienceLevel}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-400 font-semibold text-sm">
                    ${job.budget}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {job.paymentType}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-gray-400 text-xs">Skills:</span>
                  <div className="relative">
                    <span className="bg-gray-700 text-xs px-2 py-1 rounded inline-block">
                      {job.skillsRequired.length > 3 ? (
                        <>
                          {job.skillsRequired
                            .slice(0, 3)
                            .map((skill) => skill.replace(/["'\[\]]/g, ""))
                            .join(", ")}
                          <button
                            onClick={() =>
                              setExpandedJob(
                                expandedJob === job._id ? null : job._id
                              )
                            }
                            className="ml-1 text-purple-400 hover:underline focus:outline-none"
                          >
                            {expandedJob === job._id
                              ? "View Less"
                              : `+${job.skillsRequired.length - 3} More`}
                          </button>
                        </>
                      ) : (
                        job.skillsRequired
                          .map((skill) => skill.replace(/["'\[\]]/g, ""))
                          .join(", ")
                      )}
                    </span>
                    {expandedJob === job._id &&
                      job.skillsRequired.length > 3 && (
                        <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded p-2 mt-1">
                          {job.skillsRequired
                            .map((skill) => skill.replace(/["'\[\]]/g, ""))
                            .join(", ")}
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <span>
                    Posted: {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                  <span>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="p-4">
                {job.status === "Open" &&
                  (job.email === userEmail ? (
                    <span className="text-yellow-400 text-sm">Your Post</span>
                  ) : (
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm">
                      Message
                    </button>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
        {jobs.length > jobsPerPage && (
          <div className="mt-8 flex justify-center">
            {Array.from(
              { length: Math.ceil(jobs.length / jobsPerPage) },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1 ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
