"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useParams } from "next/navigation";
import { SKILLDETAILSWITHID, SKILLEDIT } from "@/shared/helpers/endpoints";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface Skill {
  title: string;
  description: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Expert";
  yearsOfExperience: number;
  availability: string;
  status: "Open" | "Close";
}

interface ValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  proficiency?: string;
  yearsOfExperience?: string;
  availability?: string;
  status?: string;
}

const SkillEdit: React.FC = () => {
  const { skillId } = useParams();
  const router = useRouter();

  const [skill, setSkill] = useState<Skill>({
    title: "",
    description: "",
    category: "",
    proficiency: "Beginner",
    yearsOfExperience: 0,
    availability: "",
    status: "Open",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const response = await axiosInstance.get(`${SKILLDETAILSWITHID}/${skillId}`);
        setSkill(response.data.response);
      } catch (error) {
        toast.error("Failed to fetch skill details");
      }
    };
    fetchSkill();
  }, [skillId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSkill((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!skill.title.trim()) newErrors.title = "Title is required";
    if (!skill.description.trim()) newErrors.description = "Description is required";
    if (!skill.category.trim()) newErrors.category = "Category is required";
    if (!skill.proficiency) newErrors.proficiency = "Proficiency is required";
    if (skill.yearsOfExperience < 0) newErrors.yearsOfExperience = "Years of experience must be non-negative";
    if (!skill.availability.trim()) newErrors.availability = "Availability is required";
    if (!skill.status) newErrors.status = "Status is required";

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
      await axiosInstance.put(`${SKILLEDIT}/${skillId}`, skill);
      toast.success("Skill updated successfully");
      setTimeout(() => router.push("/service/skill"), 1000);
    } catch (error) {
      toast.error("Failed to update skill");
    }
  };

  const inputClassName = (fieldName: keyof ValidationErrors) => `
    w-full bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300
    ${errors[fieldName] ? "border-2 border-red-500" : ""}
  `;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pt-24 pb-8 px-4">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-gray-800">
          <h1 className="text-4xl font-bold mb-2 flex items-center text-blue-400">
            <FaEdit className="mr-4" />
            Edit Skill
          </h1>
          <p className="text-gray-400">Update your skill details below</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={skill.title}
                onChange={handleInputChange}
                className={inputClassName("title")}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={skill.category}
                onChange={handleInputChange}
                className={inputClassName("category")}
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={skill.description}
              onChange={handleInputChange}
              className={`${inputClassName("description")} h-32`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Proficiency</label>
              <select
                name="proficiency"
                value={skill.proficiency}
                onChange={handleInputChange}
                className={inputClassName("proficiency")}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              {errors.proficiency && <p className="text-red-500 text-sm mt-1">{errors.proficiency}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Years of Experience</label>
              <input
                type="number"
                name="yearsOfExperience"
                value={skill.yearsOfExperience}
                onChange={handleInputChange}
                className={inputClassName("yearsOfExperience")}
              />
              {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
              <input
                type="text"
                name="availability"
                value={skill.availability}
                onChange={handleInputChange}
                className={inputClassName("availability")}
              />
              {errors.availability && <p className="text-red-500 text-sm mt-1">{errors.availability}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={skill.status}
              onChange={handleInputChange}
              className={inputClassName("status")}
            >
              <option value="Open">Open</option>
              <option value="Close">Close</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => router.push("/service/skill")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors duration-300 flex items-center"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all duration-300 flex items-center"
            >
              <FaSave className="mr-2" />
              Update Skill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillEdit;