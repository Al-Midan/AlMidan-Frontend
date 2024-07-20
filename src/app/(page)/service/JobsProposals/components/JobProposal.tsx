"use client";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/shared/helpers/axiosInstance";
import {
  GetAllProposals,
  GETJOBREQUESTS,
  GETOURJOBPOST,
  PROPOSALSTATUS,
} from "@/shared/helpers/endpoints";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [sentProposals, setSentProposals] = useState<Proposal[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
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
      const res = await axiosInstance.get<{ response: Job[] }>(
        `${GETOURJOBPOST}/${userId}`
      );
      setPostedJobs(res.data.response);
      setAllJobs((prevJobs) => [...prevJobs, ...res.data.response]);
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
        response: { dbValues: Proposal[] };
      }>(`${GetAllProposals}/${userId}`);
      setSentProposals(res.data.response.dbValues);
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
        response: { dbValues: Proposal[] };
      }>(`${GETJOBREQUESTS}/${userId}`);
      setReceivedProposals(res.data.response.dbValues);
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
      const response = await axiosInstance.post(
        `${PROPOSALSTATUS}/${proposalId}`,
        action
      );
      console.log("response", response);

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

  const renderJobCard = (job: Job) => (
    <motion.div
      key={job._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl mb-4 text-cyan-400 font-bold">{job.title}</h2>
      <div className="mb-4 h-32 overflow-hidden rounded-lg">
        <img
          src={job.image}
          alt={job.title}
          className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110"
        />
      </div>
      <p className="text-sm mb-4 line-clamp-3 text-gray-300">
        {job.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <span className="text-xs text-gray-400">Category: {job.category}</span>
        <span className="text-xs text-gray-400">Budget: ${job.budget}</span>
        <span className="text-xs text-gray-400">Duration: {job.duration}</span>
        <span className="text-xs text-gray-400">Status: {job.status}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skillsRequired.map((skill, index) => (
          <span
            key={index}
            className="bg-cyan-600 text-white px-2 py-1 rounded-full text-xs"
          >
            {skill.replace(/["'\[\]]/g, "")}
          </span>
        ))}
      </div>
      <Link href={`/jobpostEdit/${job._id}`}>
        <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors duration-300 mt-2">
          Edit Job
        </button>
      </Link>
    </motion.div>
  );

  const renderProposalCard = (proposal: Proposal) => (
    <motion.div
      key={proposal._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl mb-4 text-cyan-400 font-bold">
        Proposal for Job: {getJobTitle(proposal.jobId)}
      </h2>
      <p className="text-sm mb-4 line-clamp-3 text-gray-300">
        {proposal.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <span className="text-xs text-gray-400">
          Job Owner: {proposal.jobOwner}
        </span>
        <span className="text-xs text-gray-400">Status: {proposal.status}</span>
      </div>
      <button
        onClick={() => setSelectedProposal(proposal)}
        className="w-full bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 transition-colors duration-300 mt-2"
      >
        View Details
      </button>
      {activeSection === "received" && proposal.status === "pending" && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => handleProposalAction(proposal._id, "accept")}
            className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300 flex-1 mr-2"
          >
            Accept
          </button>
          <button
            onClick={() => handleProposalAction(proposal._id, "reject")}
            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-300 flex-1 ml-2"
          >
            Reject
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

    return (
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeSection === "posted" && postedJobs.map(renderJobCard)}
          {activeSection === "sent" && sentProposals.map(renderProposalCard)}
          {activeSection === "received" &&
            receivedProposals.map(renderProposalCard)}
        </div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <h1 className="text-4xl mb-8 text-center text-cyan-400 font-bold">
        Job Dashboard
      </h1>

      <div className="flex justify-center mb-8 bg-gray-800 rounded-full p-1">
        <button
          onClick={() => setActiveSection("posted")}
          className={`px-6 py-3 rounded-full transition-all duration-300 ${
            activeSection === "posted"
              ? "bg-cyan-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Posted Jobs
        </button>
        <button
          onClick={() => setActiveSection("sent")}
          className={`px-6 py-3 rounded-full transition-all duration-300 ${
            activeSection === "sent"
              ? "bg-cyan-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Sent Proposals
        </button>
        <button
          onClick={() => setActiveSection("received")}
          className={`px-6 py-3 rounded-full transition-all duration-300 ${
            activeSection === "received"
              ? "bg-cyan-600 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          Received Proposals
        </button>
      </div>

      {renderContent()}

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
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg max-w-2xl w-full"
          >
            <h2 className="text-2xl mb-4 text-cyan-400 font-bold">
              Proposal Details
            </h2>
            <p className="mb-4 text-gray-300">{selectedProposal.description}</p>
            <div className="mb-4">
              <a
                href={selectedProposal.image}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 transition-colors duration-300 inline-block"
              >
                View Resume PDF
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <span className="text-sm text-gray-400">
                Job Owner: {selectedProposal.jobOwner}
              </span>
              <span className="text-sm text-gray-400">
                Status: {selectedProposal.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedProposal(null)}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors duration-300"
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
