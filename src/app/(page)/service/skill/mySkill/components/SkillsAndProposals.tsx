"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/shared/helpers/axiosInstance";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DELETESKILL,
  GetAllSkillProposals,
  GETSKILLREQUESTS,
  GETOURSKILLS,
  SKILLPROPOSALSTATUS,
} from "@/shared/helpers/endpoints";

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Expert";
  yearsOfExperience: number;
  availability: string;
  username: string;
  email: string;
  dateAdded: string;
  image: string;
  status: "Open" | "Close";
  isBlock: boolean;
}

interface SkillProposal {
  _id: string;
  OwnerEmail: string;
  skillId: string;
  description: string;
  status: string;
  image: string;
}

const SkillsAndProposals: React.FC = () => {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sentProposals, setSentProposals] = useState<SkillProposal[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<SkillProposal[]>(
    []
  );
  const [activeSection, setActiveSection] = useState<
    "skills" | "sent" | "received"
  >("skills");
  const [loading, setLoading] = useState({
    skills: true,
    sent: true,
    received: true,
  });
  const [error, setError] = useState({ skills: "", sent: "", received: "" });
  const [selectedProposal, setSelectedProposal] =
    useState<SkillProposal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      const userDetails = localStorage.getItem("userData");
      const user = userDetails ? JSON.parse(userDetails) : {};
      const userId = user._id;

      if (userId) {
        await fetchSkills(userId);
        await fetchSentProposals(userId);
        await fetchReceivedProposals(userId);
      }
    };

    fetchData();
  }, []);

  const fetchSkills = async (userId: string) => {
    try {
      const res = await axiosInstance.get<{ response: Skill[] | null }>(
        `${GETOURSKILLS}/${userId}`
      );
      const skills = res.data.response;

      if (Array.isArray(skills)) {
        setSkills(skills);
      } else {
        setSkills([]);
      }

      setLoading((prev) => ({ ...prev, skills: false }));
    } catch (error) {
      console.error("Error fetching skills:", error);
      setError((prev) => ({
        ...prev,
        skills: "Failed to load skills. Please try again.",
      }));
      setLoading((prev) => ({ ...prev, skills: false }));
    }
  };

  const fetchSentProposals = async (userId: string) => {
    try {
      const res = await axiosInstance.get<{
        message: string;
        response: {
          dbValues: SkillProposal[];
          jobDocuments: Skill[];
        };
      }>(`${GetAllSkillProposals}/${userId}`);
      console.log("fetchSentProposals", res);

      if (res.data.response && res.data.response.dbValues) {
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
        message: string;
        response: {
          dbValues: SkillProposal[];
          jobDocuments: Skill[];
        };
      }>(`${GETSKILLREQUESTS}/${userId}`);
      console.log("fetchReceivedProposals", res);

      if (res.data.response && res.data.response.dbValues) {
        setReceivedProposals(res.data.response.dbValues);
      } else {
        setReceivedProposals([]);
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

  const handleProposalAction = async (
    proposalId: string,
    action: "accept" | "reject"
  ) => {
    try {
      await axiosInstance.post(`${SKILLPROPOSALSTATUS}/${proposalId}`, {
        action,
      });
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

  const deleteSkill = async (skillId: string) => {
    try {
      await axiosInstance.delete(`${DELETESKILL}/${skillId}`);
      setSkills((prevSkills) =>
        prevSkills.filter((skill) => skill._id !== skillId)
      );
    } catch (error) {
      console.error(`Error deleting skill:`, error);
    }
  };

  const renderSkillCard = (skill: Skill) => (
    <motion.div
      key={skill._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl mb-3 text-cyan-400 font-bold">{skill.title}</h2>
      <div className="mb-3 h-24 overflow-hidden rounded-lg">
        <img
          src={skill.image}
          alt={skill.title}
          className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110"
        />
      </div>
      <p className="text-xs mb-3 line-clamp-2 text-gray-300">
        {skill.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
        <span>Category: {skill.category}</span>
        <span>Proficiency: {skill.proficiency}</span>
        <span>Experience: {skill.yearsOfExperience} years</span>
        <span>Status: {skill.status}</span>
      </div>
      <Link href={`/service/skill/mySkill/${skill._id}`}>
        <button className="w-full bg-indigo-700 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors duration-300 text-sm">
          Edit Skill
        </button>
      </Link>
      <button
        onClick={() => deleteSkill(skill._id)}
        className="w-full bg-red-700 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 mt-2 text-sm"
      >
        Delete Skill
      </button>
    </motion.div>
  );

  const renderProposalCard = (proposal: SkillProposal) => (
    <motion.div
      key={proposal._id}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl mb-3 text-cyan-400 font-bold">
        Proposal for Skill
      </h2>
      <p className="text-xs mb-3 line-clamp-2 text-gray-300">
        {proposal.description}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-400">
        <span>Owner Email: {proposal.OwnerEmail}</span>
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

    let items: Skill[] | SkillProposal[] = [];
    switch (activeSection) {
      case "skills":
        items = skills;
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
            {activeSection === "skills"
              ? "You haven't added any skills yet."
              : activeSection === "sent"
              ? "You haven't sent any proposals yet."
              : "You haven't received any proposals yet."}
          </p>
          {activeSection === "skills" && (
            <Link href="/service/createSkill">
              <button className="bg-indigo-700 text-white px-6 py-3 rounded-full hover:bg-indigo-600 transition-colors duration-300 text-sm">
                Add a New Skill
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
            activeSection === "skills"
              ? renderSkillCard(item as Skill)
              : renderProposalCard(item as SkillProposal)
          )}
        </div>
      </AnimatePresence>
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
      <h1 className="text-3xl md:text-4xl mb-6 md:mb-8 text-center text-cyan-400 font-bold mt-20">
        Skills Dashboard
      </h1>

      <div className="flex justify-center mb-6 md:mb-8 bg-gray-800 bg-opacity-50 rounded-full p-1 max-w-2xl mx-auto">
        <button
          onClick={() => {
            setActiveSection("skills");
            setCurrentPage(1);
          }}
          className={`px-4 md:px-6 py-2 md:py-3 rounded-full transition-all duration-300 text-sm md:text-base ${
            activeSection === "skills"
              ? "bg-indigo-700 text-white"
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
        >
          My Skills
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
              (activeSection === "skills"
                ? skills
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
                View Attached Image
              </a>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <span className="text-gray-400">
                Owner Email: {selectedProposal.OwnerEmail}
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

export default SkillsAndProposals;
