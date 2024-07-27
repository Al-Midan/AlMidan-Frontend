"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance, { axiosInstanceMultipart } from "@/shared/helpers/axiosInstance";
import { GETSKILLS, SENDSKILLPROPOSAL } from "@/shared/helpers/endpoints";
import { toast } from "sonner";

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUserEmail(userData.email);
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axiosInstance.get(GETSKILLS);
      setSkills(response.data.response);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const handleViewMore = () => {
    setVisibleSkills((prevVisible) => prevVisible + 6);
  };

  const handleSendProposal = async (
    skill: Skill,
    proposalData: { description: string; image: File }
  ) => {
    const formData = new FormData();
    formData.append("skillId", skill._id);
    formData.append("description", proposalData.description);
    formData.append("image", proposalData.image);

    try {
      await axiosInstanceMultipart.post(SENDSKILLPROPOSAL, formData);
      toast.success("Proposal sent successfully!");
    } catch (error) {
      console.error("Error sending proposal:", error);
      toast.error("Failed to send proposal. Please try again.");
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
        <h1 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Discover Amazing Skills
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.slice(0, visibleSkills).map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              onSendProposal={handleSendProposal}
              onViewMore={openModal}
              userEmail={userEmail}
            />
          ))}
        </div>
        {visibleSkills < skills.length && (
          <div className="text-center mt-12">
            <Button
              onClick={handleViewMore}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              View More
            </Button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {selectedSkill && (
          <Modal
            skill={selectedSkill}
            onClose={closeModal}
            onSendProposal={handleSendProposal}
            userEmail={userEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SkillCard: React.FC<{
  skill: Skill;
  onSendProposal: (
    skill: Skill,
    proposalData: { description: string; image: File }
  ) => void;
  onViewMore: (skill: Skill) => void;
  userEmail: string | null;
}> = ({ skill, onSendProposal, onViewMore, userEmail }) => {
  const isUserPost = skill.email === userEmail;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden ${
        isUserPost ? "border-2 border-cyan-500" : ""
      }`}
    >
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-cyan-300">{skill.title}</h3>
        <p className="text-gray-300 mb-4">
          {skill.description.substring(0, 80)}...
        </p>
        {skill.image && (
          <img
            src={skill.image}
            alt={skill.title}
            className="mb-4 rounded-lg w-full h-40 object-cover"
          />
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-purple-400">{skill.category}</span>
          <span className="text-cyan-400">{skill.proficiency}</span>
        </div>
        <div className="mt-6 flex justify-between">
          <Button
            onClick={() => onViewMore(skill)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            View More
          </Button>
          {isUserPost ? (
            <span className="text-cyan-400 font-semibold">Your Post</span>
          ) : (
            <Button
              onClick={() =>
                onSendProposal(skill, {
                  description: "",
                  image: new File([], ""),
                })
              }
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              Send Proposal
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Modal: React.FC<{
  skill: Skill;
  onClose: () => void;
  onSendProposal: (
    skill: Skill,
    proposalData: { description: string; image: File }
  ) => void;
  userEmail: string | null;
}> = ({ skill, onClose, onSendProposal, userEmail }) => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ description?: string; image?: string }>({});
  const isUserPost = skill.email === userEmail;

  const validateForm = () => {
    const newErrors: { description?: string; image?: string } = {};
    if (!description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!image) {
      newErrors.image = "Image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSendProposal(skill, { description, image: image! });
      onClose();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewImage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full border border-cyan-500"
      >
        <h2 className="text-3xl font-bold mb-4 text-cyan-300">{skill.title}</h2>
        <p className="text-gray-300 mb-4">{skill.description}</p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <strong className="text-cyan-400">Category:</strong> {skill.category}
          </div>
          <div>
            <strong className="text-cyan-400">Proficiency:</strong> {skill.proficiency}
          </div>
          <div>
            <strong className="text-cyan-400">Experience:</strong> {skill.yearsOfExperience} years
          </div>
          <div>
            <strong className="text-cyan-400">Availability:</strong> {skill.availability}
          </div>
        </div>
        {!isUserPost && (
          <>
            <div className="mb-4">
              <label className="block text-cyan-400 mb-2">
                Proposal Description
              </label>
              <textarea
                className={`w-full p-2 rounded-lg bg-gray-800 text-white border ${
                  errors.description ? 'border-red-500' : 'border-cyan-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-cyan-400 mb-2">Upload Image</label>
              <input
                type="file"
                className={`w-full p-2 rounded-lg bg-gray-800 text-white border ${
                  errors.image ? 'border-red-500' : 'border-cyan-500'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                onChange={handleImageChange}
                accept="image/*"
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image}</p>
              )}
              {previewImage && (
                <div className="mt-2 relative">
                  <img src={previewImage} alt="Preview" className="max-w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} className="bg-gray-600">
            Close
          </Button>
          {!isUserPost && (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              Send Proposal
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const Button: React.FC<{
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, className, children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-6 py-3 text-white font-medium rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${className}`}
  >
    {children}
  </motion.button>
);

export default SkillPage;