"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETALLADMINJOB, JOBBLOCK } from "@/shared/helpers/endpoints";

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
  status: "Approved" | "Blocked";
  image: string;
  isBlock: boolean
}

const AdminJobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get(GETALLADMINJOB);
        setJobs(response.data.response);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Error fetching jobs");
      }
    };
    fetchJobs();
  }, []);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Approved" ? "Blocked" : "Approved";
    try {
      await axiosInstance.post(JOBBLOCK, { jobId, status: newStatus });
      setJobs(jobs.map(job => job._id === jobId ? { ...job, status: newStatus } : job));
      toast.success(`Job ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Error updating job status");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <Toaster />

        <h1 className="text-4xl font-bold mb-8 text-center mt-20">
          Admin Job Management
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
                <h2 className="absolute bottom-2 left-2 text-xl font-semibold">
                  {job.title}
                </h2>
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
                  <span>
                    Posted: {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  <span>Status: {job.status}</span>
                </div>
              </div>
              <div className="p-4">
                <button
                  onClick={() => toggleJobStatus(job._id, job.status)}
                  className={`w-full px-4 py-2 rounded-full shadow-lg transition duration-300 text-sm ${
                    job.status === "Approved"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {job.status === "Approved" ? "Block" : "Approve"}
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
    </div>
  );
};

export default AdminJobManagement;