"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  isBlock: boolean;
  image: string;
}

const AdminJobManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(12);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

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

  const toggleJobStatus = async (jobId: string, currentIsBlock: boolean) => {
    const newIsBlock = !currentIsBlock;
    try {
      await axiosInstance.post(JOBBLOCK, { jobId, isBlock: newIsBlock });
      setJobs(jobs.map(job => job._id === jobId ? { ...job, isBlock: newIsBlock } : job));
      toast.success(`Job ${newIsBlock ? 'blocked' : 'approved'} successfully`);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Error updating job status");
    }
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
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
                  <span>Status: {job.isBlock ? 'Blocked' : 'Approved'}</span>
                </div>
              </div>
              <div className="p-4 flex justify-between">
                <button
                  onClick={() => openJobDetails(job)}
                  className="px-4 py-2 rounded-full shadow-lg transition duration-300 text-sm bg-blue-500 hover:bg-blue-600 text-white"
                >
                  View More
                </button>
                <button
                  onClick={() => toggleJobStatus(job._id, job.isBlock)}
                  className={`px-4 py-2 rounded-full shadow-lg transition duration-300 text-sm ${
                    job.isBlock
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {job.isBlock ? "Approve" : "Block"}
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
            onClick={closeJobDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedJob.title}</h2>
              <p className="mb-2"><strong>Description:</strong> {selectedJob.description}</p>
              <p className="mb-2"><strong>Category:</strong> {selectedJob.category}</p>
              <p className="mb-2"><strong>Skills Required:</strong> {selectedJob.skillsRequired.join(', ')}</p>
              <p className="mb-2"><strong>Budget:</strong> ${selectedJob.budget}</p>
              <p className="mb-2"><strong>Payment Type:</strong> {selectedJob.paymentType}</p>
              <p className="mb-2"><strong>Duration:</strong> {selectedJob.duration}</p>
              <p className="mb-2"><strong>Posted By:</strong> {selectedJob.username}</p>
              <p className="mb-2"><strong>Email:</strong> {selectedJob.email}</p>
              <p className="mb-2"><strong>Experience Level:</strong> {selectedJob.experienceLevel}</p>
              <p className="mb-2"><strong>Posted Date:</strong> {new Date(selectedJob.postedDate).toLocaleDateString()}</p>
              <p className="mb-2"><strong>Deadline:</strong> {new Date(selectedJob.deadline).toLocaleDateString()}</p>
              <p className="mb-4"><strong>Status:</strong> {selectedJob.isBlock ? 'Blocked' : 'Approved'}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    toggleJobStatus(selectedJob._id, selectedJob.isBlock);
                    closeJobDetails();
                  }}
                  className={`px-4 py-2 rounded-full shadow-lg transition duration-300 text-sm mr-2 ${
                    selectedJob.isBlock
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {selectedJob.isBlock ? "Approve" : "Block"}
                </button>
                <button
                  onClick={closeJobDetails}
                  className="px-4 py-2 rounded-full shadow-lg transition duration-300 text-sm bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminJobManagement;