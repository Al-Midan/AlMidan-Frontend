"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { JOBDETAILSWITHID } from "@/shared/helpers/endpoints";

const JobPostEdit = () => {
  const { jobId } = useParams();
  const router = useRouter();
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

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`${JOBDETAILSWITHID}/${jobId}`);
        setJob(response.data.response);
      } catch (error) {
        toast.error("Failed to fetch job details");
      }
    };
    fetchJob();
  }, [jobId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setJob((prev) => ({ ...prev, skillsRequired: skills }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/jobs/${jobId}`, job);
      toast.success("Job updated successfully");
      setTimeout(() => router.push("/service/JobsProposals"), 2000);
    } catch (error) {
      toast.error("Failed to update job");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-900 text-white p-8"
    >
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold mb-8 text-center">Edit Job Post</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={job.title}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={job.description}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded h-32"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Category</label>
          <input
            type="text"
            name="category"
            value={job.category}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">
            Skills Required (comma-separated)
          </label>
          <input
            type="text"
            name="skillsRequired"
            value={job.skillsRequired.join(", ")}
            onChange={handleSkillsChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Budget</label>
          <input
            type="number"
            name="budget"
            value={job.budget}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Payment Type</label>
          <select
            name="paymentType"
            value={job.paymentType}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="Fixed Price">Fixed Price</option>
            <option value="Hourly">Hourly</option>
          </select>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Duration</label>
          <input
            type="text"
            name="duration"
            value={job.duration}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Experience Level</label>
          <select
            name="experienceLevel"
            value={job.experienceLevel}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Deadline</label>
          <input
            type="date"
            name="deadline"
            value={job.deadline}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          />
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <label className="block mb-2">Status</label>
          <select
            name="status"
            value={job.status}
            onChange={handleInputChange}
            className="w-full bg-gray-700 text-white p-2 rounded"
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Update Job
        </motion.button>
      </form>
    </motion.div>
  );
};

export default JobPostEdit;
