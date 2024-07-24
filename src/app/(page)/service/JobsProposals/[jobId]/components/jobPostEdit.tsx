"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { JOBDETAILSWITHID, JOBEDIT } from "@/shared/helpers/endpoints";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface Job {
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: number;
  paymentType: string;
  duration: string;
  experienceLevel: string;
  deadline: string;
  status: string;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  skillsRequired?: string;
  budget?: string;
  paymentType?: string;
  duration?: string;
  experienceLevel?: string;
  deadline?: string;
  status?: string;
}

const JobPostEdit: React.FC = () => {
  const { jobId } = useParams();
  const router = useRouter();
  
  const [job, setJob] = useState<Job>({
    title: "",
    description: "",
    category: "",
    skillsRequired: [],
    budget: 0,
    paymentType: "",
    duration: "",
    experienceLevel: "",
    deadline: "",
    status: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axiosInstance.get(`${JOBDETAILSWITHID}/${jobId}`);
        setJob(response.data.response);
      } catch (error) {
        toast.error("Failed to fetch job details");
      }
    };
    fetchJob();
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value === "" ? null : value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim()).filter((skill) => skill !== "");
    setJob((prev) => ({ ...prev, skillsRequired: skills }));
    if (errors.skillsRequired) {
      setErrors((prev) => ({ ...prev, skillsRequired: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
  
    if (!job.title || job.title.trim() === "") newErrors.title = "Title is required";
    if (!job.description || job.description.trim() === "") newErrors.description = "Description is required";
    if (!job.category || job.category.trim() === "") newErrors.category = "Category is required";
    if (!job.skillsRequired || job.skillsRequired.length === 0) newErrors.skillsRequired = "At least one skill is required";
    if (job.budget === null || job.budget === undefined || job.budget < 0) newErrors.budget = "Budget must be a non-negative number";
    if (!job.paymentType || job.paymentType.trim() === "") newErrors.paymentType = "Payment type is required";
    if (!job.duration || job.duration.trim() === "") newErrors.duration = "Duration is required";
    if (!job.experienceLevel || job.experienceLevel.trim() === "") newErrors.experienceLevel = "Experience level is required";
    if (!job.deadline || job.deadline.trim() === "") newErrors.deadline = "Deadline is required";
    if (!job.status || job.status.trim() === "") newErrors.status = "Status is required";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors before submitting");
      return;
    }
    try {
      await axiosInstance.put(`${JOBEDIT}/${jobId}`, job);
      toast.success("Job updated successfully");
      setTimeout(() => router.push("/service/JobsProposals"), 2000);
    } catch (error) {
      toast.error("Failed to update job");
    }
  };

  const inputClassName = (fieldName: keyof ValidationErrors) => `
    w-full bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300
    ${errors[fieldName] ? 'border-2 border-red-500' : ''}
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-8">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 bg-gradient-to-r from-blue-900 to-purple-900">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <FaEdit className="mr-4" />
            Edit Job Post
          </h1>
          <p className="text-blue-300">Update your job posting details below</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={job.title}
                onChange={handleInputChange}
                className={inputClassName('title')}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={job.category}
                onChange={handleInputChange}
                className={inputClassName('category')}
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2">Description</label>
            <textarea
              name="description"
              value={job.description}
              onChange={handleInputChange}
              className={`${inputClassName('description')} h-32`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Skills Required</label>
              <input
                type="text"
                name="skillsRequired"
                value={job.skillsRequired.join(", ")}
                onChange={handleSkillsChange}
                className={inputClassName('skillsRequired')}
              />
              {errors.skillsRequired && <p className="text-red-500 text-sm mt-1">{errors.skillsRequired}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Budget</label>
              <input
                type="number"
                name="budget"
                value={job.budget}
                onChange={handleInputChange}
                className={inputClassName('budget')}
              />
              {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Payment Type</label>
              <select
                name="paymentType"
                value={job.paymentType}
                onChange={handleInputChange}
                className={inputClassName('paymentType')}
              >
                <option value="Fixed Price">Fixed Price</option>
                <option value="Hourly">Hourly</option>
              </select>
              {errors.paymentType && <p className="text-red-500 text-sm mt-1">{errors.paymentType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Duration</label>
              <input
                type="text"
                name="duration"
                value={job.duration}
                onChange={handleInputChange}
                className={inputClassName('duration')}
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Experience Level</label>
              <select
                name="experienceLevel"
                value={job.experienceLevel}
                onChange={handleInputChange}
                className={inputClassName('experienceLevel')}
              >
                <option value="">Select experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              {errors.experienceLevel && <p className="text-red-500 text-sm mt-1">{errors.experienceLevel}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={job.deadline}
                onChange={handleInputChange}
                className={inputClassName('deadline')}
              />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Status</label>
              <select
                name="status"
                value={job.status}
                onChange={handleInputChange}
                className={inputClassName('status')}
              >
                <option value="">Select status</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => router.push("/service/JobsProposals")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center"
            >
              <FaSave className="mr-2" />
              Update Job
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default JobPostEdit;