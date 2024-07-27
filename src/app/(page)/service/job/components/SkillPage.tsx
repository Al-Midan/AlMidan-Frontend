"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance  from '@/shared/helpers/axiosInstance';
import { GETSKILLS, SENDSKILLPROPOSAL } from '@/shared/helpers/endpoints';

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
  dateAdded: Date;
  image: string;
  status: "Open" | "Close";
}

const SkillPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [visibleSkills, setVisibleSkills] = useState<number>(6);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axiosInstance.get(GETSKILLS);
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleViewMore = () => {
    setVisibleSkills(prevVisible => prevVisible + 6);
  };

  const handleSendProposal = async (skill: Skill) => {
    try {
      await axiosInstance.post(SENDSKILLPROPOSAL, { skillId: skill._id });
      alert('Proposal sent successfully!');
    } catch (error) {
      console.error('Error sending proposal:', error);
      alert('Failed to send proposal. Please try again.');
    }
  };

  const openModal = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const closeModal = () => {
    setSelectedSkill(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Discover Amazing Skills
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.slice(0, visibleSkills).map((skill) => (
            <SkillCard key={skill._id} skill={skill} onSendProposal={handleSendProposal} onViewMore={openModal} />
          ))}
        </div>
        {visibleSkills < skills.length && (
          <div className="text-center mt-12">
            <Button onClick={handleViewMore} className="bg-gradient-to-r from-purple-500 to-indigo-500">
              View More
            </Button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedSkill && (
          <Modal skill={selectedSkill} onClose={closeModal} onSendProposal={handleSendProposal} />
        )}
      </AnimatePresence>
    </div>
  );
};

const SkillCard: React.FC<{ skill: Skill; onSendProposal: (skill: Skill) => void; onViewMore: (skill: Skill) => void }> = ({ skill, onSendProposal, onViewMore }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
  >
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-2">{skill.title}</h3>
      <p className="text-gray-300 mb-4">{skill.description.substring(0, 100)}...</p>
      <div className="flex justify-between items-center">
        <span className="text-purple-400">{skill.category}</span>
        <span className="text-green-400">{skill.proficiency}</span>
      </div>
      <div className="mt-6 flex justify-between">
        <Button onClick={() => onViewMore(skill)} className="bg-gradient-to-r from-blue-500 to-purple-500">
          View More
        </Button>
        <Button onClick={() => onSendProposal(skill)} className="bg-gradient-to-r from-green-400 to-blue-500">
          Send Proposal
        </Button>
      </div>
    </div>
  </motion.div>
);

const Modal: React.FC<{ skill: Skill; onClose: () => void; onSendProposal: (skill: Skill) => void }> = ({ skill, onClose, onSendProposal }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full"
    >
      <h2 className="text-3xl font-bold mb-4">{skill.title}</h2>
      <p className="text-gray-300 mb-4">{skill.description}</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <strong>Category:</strong> {skill.category}
        </div>
        <div>
          <strong>Proficiency:</strong> {skill.proficiency}
        </div>
        <div>
          <strong>Experience:</strong> {skill.yearsOfExperience} years
        </div>
        <div>
          <strong>Availability:</strong> {skill.availability}
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Button onClick={onClose} className="bg-gray-600">
          Close
        </Button>
        <Button onClick={() => onSendProposal(skill)} className="bg-gradient-to-r from-green-400 to-blue-500">
          Send Proposal
        </Button>
      </div>
    </motion.div>
  </motion.div>
);

const Button: React.FC<{
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, className, children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-3 text-white font-medium rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${className}`}
  >
    {children}
  </motion.button>
);

export default SkillPage;