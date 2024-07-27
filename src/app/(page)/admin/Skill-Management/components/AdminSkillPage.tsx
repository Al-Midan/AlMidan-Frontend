"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import  axiosInstance  from '@/shared/helpers/axiosInstance';
import { GETADMINSKILLS, TOGGLESKILLBLOCK } from '@/shared/helpers/endpoints';

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
  isBlock: boolean;
}

const AdminSkillPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(GETADMINSKILLS);
      setSkills(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to fetch skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (skillId: string, currentBlockStatus: boolean) => {
    try {
      await axiosInstance.post(TOGGLESKILLBLOCK, { skillId, isBlock: !currentBlockStatus });
      setSkills(skills.map(skill => 
        skill._id === skillId ? { ...skill, isBlock: !currentBlockStatus } : skill
      ));
    } catch (error) {
      console.error('Error toggling skill block status:', error);
      alert('Failed to update skill status. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Admin Skill Management
        </h1>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <SkillCard 
                key={skill._id} 
                skill={skill} 
                onToggleBlock={handleToggleBlock}
                onViewDetails={() => setSelectedSkill(skill)}
              />
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedSkill && (
          <SkillDetailsModal 
            skill={selectedSkill} 
            onClose={() => setSelectedSkill(null)}
            onToggleBlock={handleToggleBlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SkillCard: React.FC<{ 
  skill: Skill; 
  onToggleBlock: (skillId: string, currentBlockStatus: boolean) => void;
  onViewDetails: () => void;
}> = ({ skill, onToggleBlock, onViewDetails }) => (
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
      <div className="mt-6 flex justify-between items-center">
        <Button onClick={onViewDetails} className="bg-gradient-to-r from-blue-500 to-purple-500">
          View Details
        </Button>
        <ToggleButton
          isActive={!skill.isBlock}
          onToggle={() => onToggleBlock(skill._id, skill.isBlock)}
        />
      </div>
    </div>
  </motion.div>
);

const SkillDetailsModal: React.FC<{
  skill: Skill;
  onClose: () => void;
  onToggleBlock: (skillId: string, currentBlockStatus: boolean) => void;
}> = ({ skill, onClose, onToggleBlock }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
        <div><strong>Category:</strong> {skill.category}</div>
        <div><strong>Proficiency:</strong> {skill.proficiency}</div>
        <div><strong>Experience:</strong> {skill.yearsOfExperience} years</div>
        <div><strong>Availability:</strong> {skill.availability}</div>
        <div><strong>Username:</strong> {skill.username}</div>
        <div><strong>Email:</strong> {skill.email}</div>
        <div><strong>Status:</strong> {skill.status}</div>
        <div><strong>Date Added:</strong> {new Date(skill.dateAdded).toLocaleDateString()}</div>
      </div>
      <div className="flex justify-between items-center">
        <Button onClick={onClose} className="bg-gray-600">
          Close
        </Button>
        <ToggleButton
          isActive={!skill.isBlock}
          onToggle={() => onToggleBlock(skill._id, skill.isBlock)}
        />
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

const ToggleButton: React.FC<{
  isActive: boolean;
  onToggle: () => void;
}> = ({ isActive, onToggle }) => (
  <motion.button
    className={`relative inline-flex items-center h-8 rounded-full w-14 focus:outline-none ${
      isActive ? 'bg-green-500' : 'bg-red-500'
    }`}
    onClick={onToggle}
    whileTap={{ scale: 0.95 }}
  >
    <span className="sr-only">Toggle skill status</span>
    <motion.span
      className={`inline-block w-6 h-6 transform bg-white rounded-full`}
      initial={false}
      animate={{ x: isActive ? 24 : 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </motion.button>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-64">
    <motion.div
      className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center text-red-500 text-2xl mt-10">
    {message}
  </div>
);

export default AdminSkillPage;