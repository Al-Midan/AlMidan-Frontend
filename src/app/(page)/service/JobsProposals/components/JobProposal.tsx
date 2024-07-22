"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/shared/helpers/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DELETEJOB,
  GetAllProposals,
  GETJOBREQUESTS,
  GETOURJOBPOST,
  PROPOSALSTATUS,
} from "@/shared/helpers/endpoints";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: number;
  paymentType: string;
  duration: string;
  username: string;
  email: string;
  experienceLevel: string;
  postedDate: string;
  deadline: string;
  status: string;
  image: string;
}

interface Proposal {
  _id: string;
  jobId: string;
  jobOwner: string;
  jobOwnerEmail: string;
  description: string;
  status: string;
  image: string;
  userId: string;
}

const JobProposal: React.FC = () => {
  const router = useRouter()
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [sentProposals, setSentProposals] = useState<Proposal[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
  const [receivedProposalName, setReceivedProposalName] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<
    "posted" | "sent" | "received"
  >("posted");
  const [loading, setLoading] = useState({
    posted: true,
    sent: true,
    received: true,
  });
  const [error, setError] = useState({ posted: "", sent: "", received: "" });
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      const userDetails = localStorage.getItem("userData");
      const user = userDetails ? JSON.parse(userDetails) : {};
      const userId = user._id;

      if (userId) {
        await fetchPostedJobs(userId);
        await fetchSentProposals(userId);
        await fetchReceivedProposals(userId);
      }
    };

    fetchData();
  }, []);
  const fetchPostedJobs = async (userId: string) => {
    try {
      const res = await axiosInstance.get<{ response: Job[] | null }>(
        `${GETOURJOBPOST}/${userId}`
      );
  
      const jobs = res.data.response;
  
      if (Array.isArray(jobs)) {
        setPostedJobs(jobs);
        console.log("fetchPostedJobs", jobs);
        setAllJobs((prevJobs) => [...prevJobs, ...jobs]);
      } else {
        setPostedJobs([]);
        setAllJobs([]);
      }
  
      setLoading((prev) => ({ ...prev, posted: false }));
    } catch (error) {
      console.error("Error fetching posted jobs:", error);
      setError((prev) => ({
        ...prev,
        posted: "Failed to load posted jobs. Please try again.",
      }));
      setLoading((prev) => ({ ...prev, posted: false }));
    }
  };
  
  
  const fetchSentProposals = async (userId: string) => {
    try {
      const res = await axiosInstance.get<{
        response: { dbValues: Proposal[] } | null;
      }>(`${GetAllProposals}/${userId}`);
      if (res.data.response && res.data.response.dbValues) {
        console.log("fetchSentProposals",res.data.response);
        setSentProposals(res.data.response.dbValues);
      } else {
        setSentProposals([]);
      }
      setLoading((prev) => ({ ...prev, sent: false }));
    } catch (error) {
      console.error("Error fetching sent proposals:", error);
      setError((prev) => ({
        ...prev,
        sent: "Failed to load sent proposals. Please try again.",
      }));
      setLoading((prev) => ({ ...prev, sent: false }));
    }
  };

  const fetchReceivedProposals = async (userId: string) => {
    try {
      const res = await axiosInstance.get<{
        response: { dbValues: Proposal[] } | null;
      }>(`${GETJOBREQUESTS}/${userId}`);
  
      if (res.data.response && res.data.response.dbValues) {
        setReceivedProposals(res.data.response.dbValues);
        console.log("fetchReceivedProposals",res.data.response);
        setReceivedProposalName(res.data.response[0]);
      } else {
        setReceivedProposals([]);
        setReceivedProposalName(null);
      }
      setLoading((prev) => ({ ...prev, received: false }));
    } catch (error) {
      console.error("Error fetching received proposals:", error);
      setError((prev) => ({
        ...prev,
        received: "Failed to load received proposals. Please try again.",
      }));
      setLoading((prev) => ({ ...prev, received: false }));
    }
  };

  const getJobTitle = (jobId: string) => {
    const job = allJobs.find((job) => job._id === jobId);
    return job ? job.title : "Untitled Job";
  };

  const handleProposalAction = async (
    proposalId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const res = await axiosInstance.post(`${PROPOSALSTATUS}/${proposalId}`, {
        action,
      });
      console.log("res", res);

      setReceivedProposals((prevProposals) =>
        prevProposals.map((proposal) =>
          proposal._id === proposalId
            ? {
                ...proposal,
                status: action === "accept" ? "accepted" : "rejected",
              }
            : proposal
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing proposal:`, error);
    }
  };

  const deleteJobPost = async (jobId: string) => {
    try {
      await axiosInstance.delete(`${DELETEJOB}/${jobId}`);
      setPostedJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.error(`Error deleting job post:`, error);
    }
  };
  const handleSendMessage = (proposalId:string) => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedUserData = JSON.parse(userData);
      const currentUserId = parsedUserData._id;
      router.push(`/chat?senderId=${currentUserId}&receiverId=${proposalId}`);
    }
  };
  const renderJobCard = (job: Job) => (
    <motion.div
      key={job._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        backgroundColor: "rgba(17, 25, 40, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.125)",
      }}
    >
      <h2 className="text-xl mb-3 text-cyan-400 font-bold">{job.title}</h2>
      <div className="mb-3 h-24 overflow-hidden rounded-lg">
        <img
          src={job.image}
          alt={job.title}
          className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110"
        />
      </div>
      <p className="text-xs mb-3 line-clamp-2 text-gray-300">
        {job.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
        <span>Category: {job.category}</span>
        <span>Budget: ${job.budget}</span>
        <span>Duration: {job.duration}</span>
        <span>Status: {job.status}</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {job.skillsRequired.slice(0, 3).map((skill, index) => (
          <span
            key={index}
            className="bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full text-xs"
          >
            {skill.replace(/["'\[\]]/g, "")}
          </span>
        ))}
        {job.skillsRequired.length > 3 && (
          <span className="bg-cyan-800 text-cyan-200 px-2 py-1 rounded-full text-xs">
            +{job.skillsRequired.length - 3} more
          </span>
        )}
      </div>
      <Link href={`/service/JobsProposals/${job._id}`}>
        <button className="w-full bg-indigo-700 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300 text-sm">
          Edit Job
        </button>
      </Link>
      <button
        onClick={() => deleteJobPost(job._id)}
        className="w-full bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 mt-2 text-sm"
      >
        Delete Post
      </button>
    </motion.div>
  );

  const renderProposalCard = (proposal: Proposal) => (
    <motion.div
      key={proposal._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        backgroundColor: "rgba(17, 25, 40, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.125)",
      }}
    >
      <h2 className="text-xl mb-3 text-cyan-400 font-bold">
        Proposal for Job:{" "}
        {getJobTitle(proposal.jobId) === "Untitled Job"
          ? receivedProposalName?.title
          : getJobTitle(proposal.jobId)}
      </h2>
      <p className="text-xs mb-3 line-clamp-2 text-gray-300">
        {proposal.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
        <span>Job Owner: {proposal.jobOwner}</span>
        <span>Status: {proposal.status}</span>
      </div>
      <button
        onClick={() => setSelectedProposal(proposal)}
        className="w-full bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-colors duration-300 text-sm"
      >
        View Details
      </button>
      {activeSection === "received" && proposal.status === "pending" && (
        <div className="mt-2 flex justify-between">
          <button
            onClick={() => handleProposalAction(proposal._id, "accept")}
            className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300 flex-1 mr-2 text-sm"
          >
            Accept
          </button>
          <button
            onClick={() => handleProposalAction(proposal._id, "reject")}
            className="bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 flex-1 ml-2 text-sm"
          >
            Reject
          </button>
        </div>
      )}
      {proposal.status === "accept" && (
        <div className="mt-2">
          <button
        onClick={()=>handleSendMessage(proposal.userId)}

            className="w-full bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 text-sm"
          >
            Send Message
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderContent = () => {
    if (loading[activeSection]) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-cyan-500"></div>
        </div>
      );
    }
  
    if (error[activeSection]) {
      return (
        <div className="text-red-500 text-center">{error[activeSection]}</div>
      );
    }
  
    let items: Job[] | Proposal[] = [];
    switch (activeSection) {
      case "posted":
        items = postedJobs;
        break;
      case "sent":
        items = sentProposals;
        break;
      case "received":
        items = receivedProposals;
        break;
    }
  
    if (items.length === 0) {
      return (
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {activeSection === "posted"
              ? "You haven't posted any jobs yet."
              : activeSection === "sent"
              ? "You haven't sent any proposals yet."
              : "You haven't received any proposals yet."}
          </p>
          {activeSection === "posted" && (
            <Link href="/service/createJob">
              <button className="bg-indigo-700 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 text-sm">
                Create a New Job
              </button>
            </Link>
          )}
        </div>
      );
    }
  

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

    return (
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentItems.map((item) =>
            activeSection === "posted"
              ? renderJobCard(item as Job)
              : renderProposalCard(item as Proposal)
          )}
        </div>
      </AnimatePresence>
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <h1 className="text-3xl md:text-4xl mb-6 md:mb-8 text-center text-cyan-400 font-bold mt-20">
        Job Dashboard
      </h1>

      <div className="flex justify-center mb-6 md:mb-8 bg-gray-800 bg-opacity-50 rounded-full p-1 max-w-2xl mx-auto">
        <button
          onClick={() => {
            setActiveSection("posted");
            setCurrentPage(1);
          }}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 text-sm md:text-base ${
            activeSection === "posted"
              ? "bg-indigo-700 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Posted Jobs
        </button>
        <button
          onClick={() => {
            setActiveSection("sent");
            setCurrentPage(1);
          }}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 text-sm md:text-base ${
            activeSection === "sent"
              ? "bg-indigo-700 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Sent Proposals
        </button>
        <button
          onClick={() => {
            setActiveSection("received");
            setCurrentPage(1);
          }}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 text-sm md:text-base ${
            activeSection === "received"
              ? "bg-indigo-700 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Received Proposals
        </button>
      </div>

      {renderContent()}

      <div className="flex justify-center mt-6 md:mt-8">
        {Array.from(
          {
            length: Math.ceil(
              (activeSection === "posted"
                ? postedJobs
                : activeSection === "sent"
                ? sentProposals
                : receivedProposals
              ).length / itemsPerPage
            ),
          },
          (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`mx-1 px-3 py-1 rounded-full text-sm ${
                currentPage === i + 1
                  ? "bg-indigo-700 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          )
        )}
      </div>

      {selectedProposal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg max-w-md w-full"
            style={{
              backdropFilter: "blur(16px) saturate(180%)",
              backgroundColor: "rgba(17, 25, 40, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.125)",
            }}
          >
            <h2 className="text-2xl mb-4 text-cyan-400 font-bold">
              Proposal Details
            </h2>
            <p className="mb-4 text-gray-300 text-sm">
              {selectedProposal.description}
            </p>
            <div className="mb-4">
              <a
                href={selectedProposal.image}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-teal-600 transition-colors duration-300 inline-block text-sm"
              >
                View Resume PDF
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <span className="text-gray-400">
                Job Owner: {selectedProposal.jobOwner}
              </span>
              <span className="text-gray-400">
                Status: {selectedProposal.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedProposal(null)}
              className="mt-4 bg-indigo-700 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300 w-full text-sm"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
     
    </div>
  );
};

export default JobProposal;
