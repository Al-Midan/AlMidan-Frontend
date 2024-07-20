"use client";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GetAllProposals, GETJOBREQUESTS, GETOURJOBPOST } from "@/shared/helpers/endpoints";
import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';

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
  userId: string;
  jobId: string;
  jobOwner: string;
  jobOwnerEmail: string;
  description: string;
  status: string;
  image: string;
}

const JobProposal: React.FC = () => {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [sentProposals, setSentProposals] = useState<Proposal[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'posted' | 'sent' | 'received'>('posted');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== "undefined") {
        const userDetails = localStorage.getItem("userData");
        const user = userDetails ? JSON.parse(userDetails) : {};
        const userId = user._id;

        if (userId) {
          try {
            const [postedJobsRes, sentProposalsRes, receivedProposalsRes] = await Promise.all([
              axiosInstance.get<{ response: Job[] }>(`${GETOURJOBPOST}/${userId}`),
              axiosInstance.get<{ response: Proposal[] }>(`${GetAllProposals}/${userId}`),
              axiosInstance.get<{ response: Proposal[] }>(`${GETJOBREQUESTS}/${userId}`)
            ]);

            setPostedJobs(postedJobsRes.data.response);
            setSentProposals(sentProposalsRes.data.response);
            setReceivedProposals(receivedProposalsRes.data.response);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (proposalId: string, newStatus: string) => {
    try {
      await axiosInstance.put(`/api/proposals/${proposalId}`, { status: newStatus });
      setReceivedProposals(prevProposals =>
        prevProposals.map(proposal =>
          proposal._id === proposalId ? { ...proposal, status: newStatus } : proposal
        )
      );
    } catch (error) {
      console.error("Error updating proposal status:", error);
    }
  };

  const renderJobCard = (job: Job) => (
    <div key={job._id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">{job.title}</h2>
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">{job.status}</span>
      </div>
      <p className="text-sm mb-4 text-gray-300 line-clamp-3">{job.description}</p>
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-400">
        <span>Category: {job.category}</span>
        <span>Budget: ${job.budget}</span>
        <span>Duration: {job.duration}</span>
        <span>Experience: {job.experienceLevel}</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skillsRequired.map((skill, index) => (
          <span key={index} className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs">
            {skill}
          </span>
        ))}
      </div>
      {job.image && (
        <img src={job.image} alt={job.title} className="w-full h-32 object-cover rounded-md mb-4" />
      )}
    </div>
  );

  const renderProposalCard = (proposal: Proposal, isReceived: boolean) => (
    <div key={proposal._id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-cyan-400">{isReceived ? proposal.jobOwner : 'Your Proposal'}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${
          proposal.status === 'pending' ? 'bg-yellow-600 text-yellow-100' :
          proposal.status === 'accepted' ? 'bg-green-600 text-green-100' :
          'bg-red-600 text-red-100'
        }`}>
          {proposal.status}
        </span>
      </div>
      <p className="text-sm mb-4 text-gray-300 line-clamp-3">{proposal.description}</p>
      {proposal.image && (
        <img src={proposal.image} alt="Proposal" className="w-full h-32 object-cover rounded-md mb-4" />
      )}
      {isReceived && proposal.status === 'pending' && (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => handleStatusChange(proposal._id, 'accepted')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center"
          >
            <FaCheck className="mr-2" /> Accept
          </button>
          <button
            onClick={() => handleStatusChange(proposal._id, 'rejected')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center"
          >
            <FaTimes className="mr-2" /> Reject
          </button>
        </div>
      )}
      {((isReceived && proposal.status === 'accepted') || (!isReceived && proposal.status === 'accepted')) && (
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors duration-300 flex items-center justify-center w-full">
          <FaEnvelope className="mr-2" /> Message
        </button>
      )}
    </div>
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeTab === 'posted'
    ? postedJobs.slice(indexOfFirstItem, indexOfLastItem)
    : activeTab === 'sent'
      ? sentProposals.slice(indexOfFirstItem, indexOfLastItem)
      : receivedProposals.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(
    (activeTab === 'posted'
      ? postedJobs.length
      : activeTab === 'sent'
        ? sentProposals.length
        : receivedProposals.length) / itemsPerPage
  );

  return (
    <div className="min-h-screen p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <h1 className="text-4xl mb-8 text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
        Job Dashboard
      </h1>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => setActiveTab('posted')}
          className={`px-4 py-2 rounded-l-full ${
            activeTab === 'posted' ? 'bg-purple-600' : 'bg-gray-700'
          } transition-colors duration-300`}
        >
          Posted Jobs
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 ${
            activeTab === 'sent' ? 'bg-purple-600' : 'bg-gray-700'
          } transition-colors duration-300`}
        >
          Sent Proposals
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-r-full ${
            activeTab === 'received' ? 'bg-purple-600' : 'bg-gray-700'
          } transition-colors duration-300`}
        >
          Received Proposals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentItems.map((item) =>
          activeTab === 'posted'
            ? renderJobCard(item as Job)
            : renderProposalCard(item as Proposal, activeTab === 'received')
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors duration-300 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <span className="text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition-colors duration-300 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default JobProposal;