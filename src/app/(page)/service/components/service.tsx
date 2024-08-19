"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import axiosInstance, {
  axiosInstanceMultipart,
} from "@/shared/helpers/axiosInstance";
import { GETALLJOB, SENDPROPOSAL } from "@/shared/helpers/endpoints";

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
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalCV, setProposalCV] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // New state for search, sort, and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("postedDate");
  const [filterCategory, setFilterCategory] = useState("All");

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

  const filteredAndSortedJobs = useMemo(() => {
    return jobs
      .filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((job) =>
        filterCategory === "All" ? true : job.category === filterCategory
      )
      .sort((a, b) => {
        if (sortBy === "postedDate") {
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        } else if (sortBy === "budget") {
          return b.budget - a.budget;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [jobs, searchTerm, sortBy, filterCategory]);

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredAndSortedJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const userData = localStorage.getItem("userData");
    let userId = "";

    if (userData) {
      const user = JSON.parse(userData);
      userId = user._id;
    }

    if (!userId) {
      toast.error("User ID not found", {
        style: { background: "#333", color: "#fff" },
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("jobId", selectedJob._id);
    formData.append("jobOwner", selectedJob.username);
    formData.append("jobOwnerEmail", selectedJob.email);
    formData.append("description", proposalDescription);
    if (proposalCV) {
      formData.append("cv", proposalCV);
    }

    try {
      const response = await axiosInstanceMultipart.post(
        SENDPROPOSAL,
        formData
      );
      const success = toast.success("Proposal sent successfully", {
        className: cn(
          "flex max-w-fit md:min-w-[70vw] lg:min-w-fit fixed z-[5000] top-10 inset-x-0 mx-auto px-10 py-5 rounded-lg border border-black/.1 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] items-center justify-center space-x-4"
        ),
        style: {
          backdropFilter: "blur(16px) saturate(180%)",
          backgroundColor: "rgba(17, 25, 40, 0.75)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.125)",
          color: "#fff",
        },
        position: "top-center",
      });

      setTimeout(() => {
        toast.dismiss(success);
      }, 2000);
      setShowProposalForm(false);
      setSelectedJob(null);
      setProposalDescription("");
      setProposalCV(null);
    } catch (error) {
      toast.error("Error sending proposal", {
        style: { background: "#333", color: "#fff" },
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCategories = useMemo(() => {
    return ["All", ...Array.from(new Set(jobs.map((job) => job.category)))];
  }, [jobs]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="absolute top-7 right-4">
          <button
            onClick={() => router.push("/service/JobsProposals")}
            className={`
              flex items-center justify-center
              px-6 py-3 max-w-fit mx-auto
              text-sm font-medium text-cyan-300
              bg-gray-900 bg-opacity-70
              border border-cyan-500 border-opacity-50
              rounded-xl
              shadow-lg shadow-cyan-500/20
              transition-all duration-300 ease-in-out
              hover:bg-cyan-900 hover:bg-opacity-30
              hover:text-cyan-200 hover:border-cyan-400
              hover:shadow-cyan-500/40
              focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50
              active:scale-95
            `}
            style={{
              backdropFilter: "blur(10px) saturate(150%)",
            }}
          >
            <span className="mr-2">My Jobs & Proposals</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <Toaster />

        <h1 className="text-4xl font-bold mb-8 text-center mt-20">
          Job Listings
        </h1>

        {/* Search, Sort, and Filter Controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="postedDate">Sort by Date</option>
            <option value="budget">Sort by Budget</option>
            <option value="title">Sort by Title</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-800 text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

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
        {filteredAndSortedJobs.length > jobsPerPage && (
          <div className="mt-8 flex justify-center">
            {Array.from(
              { length: Math.ceil(filteredAndSortedJobs.length / jobsPerPage) },
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
            key="job-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => {
              setSelectedJob(null);
              setShowProposalForm(false);
            }}
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
                  <span className="ml-2 text-green-400">
                    ${selectedJob.budget}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Payment:</span>
                  <span className="ml-2">{selectedJob.paymentType}</span>
                </div>
                <div>
                  <span className="text-gray-400">Posted:</span>
                  <span className="ml-2">
                    {new Date(selectedJob.postedDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Deadline:</span>
                  <span className="ml-2">
                    {new Date(selectedJob.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-gray-400">Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedJob.skillsRequired.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {skill.replace(/["'\[\]]/g, "")}
                    </span>
                  ))}
                </div>
              </div>
              {selectedJob.status === "Open" &&
                selectedJob.email !== userEmail && (
                  <button
                    onClick={() => setShowProposalForm(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm"
                  >
                    Send Proposal
                  </button>
                )}
              {selectedJob.status === "Closed" &&
                selectedJob.email !== userEmail && (
                  <button className="w-full bg-gray-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm cursor-not-allowed">
                    Currently Closed
                  </button>
                )}
              {selectedJob.email === userEmail && (
                <span className="text-yellow-400 text-sm">Your Post</span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProposalForm && selectedJob && (
          <motion.div
            key="proposal-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setShowProposalForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Send Proposal</h2>
              <form onSubmit={handleSendProposal} className="space-y-4">
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={proposalDescription}
                    onChange={(e) => setProposalDescription(e.target.value)}
                    required
                    className="w-full bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    rows={4}
                  ></textarea>
                </div>
                <div>
                  <label
                    htmlFor="cv"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Upload CV
                  </label>
                  <input
                    type="file"
                    id="cv"
                    onChange={(e) =>
                      setProposalCV(e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full bg-gray-700 text-white rounded-md p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition duration-300 text-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send Proposal"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;