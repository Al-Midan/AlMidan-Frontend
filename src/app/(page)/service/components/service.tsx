"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center mt-20">
          Job Listings
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentJobs.map((job) => (
            <motion.div
              key={job._id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={job.image || ""}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <h2 className="absolute bottom-2 left-2 text-xl font-semibold">{job.title}</h2>
              </div>
              <div className="p-4 flex-grow">
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
                <div className="text-xs text-gray-400 mb-2">
                  <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="p-4">
                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm"
                >
                  View Details
                </button>
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
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelectedJob(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
              <p className="text-gray-300 mb-4">{selectedJob.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="ml-2">{selectedJob.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Experience:</span>
                  <span className="ml-2">{selectedJob.experienceLevel}</span>
                </div>
                <div>
                  <span className="text-gray-400">Budget:</span>
                  <span className="ml-2 text-green-400">${selectedJob.budget}</span>
                </div>
                <div>
                  <span className="text-gray-400">Payment:</span>
                  <span className="ml-2">{selectedJob.paymentType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Posted:</span>
                  <span className="ml-2">{new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Deadline:</span>
                  <span className="ml-2">{new Date(selectedJob.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedJob.skillsRequired.map((skill, index) => (
                    <span key={index} className="bg-gray-700 text-xs px-2 py-1 rounded">
                      {skill.replace(/["'\[\]]/g, "")}
                    </span>
                  ))}
                </div>
              </div>
              {selectedJob.status === "Open" && selectedJob.email !== userEmail && (
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm">
                  Send Proposal
                </button>
              )}
              {selectedJob.email === userEmail && (
                <span className="text-yellow-400 text-sm">Your Post</span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;
