"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  COURSECOMPLAINTS,
  ENROLLEDCOURSES,
  GENERALCOMPLAINTS,
  SERVICECOMPLAINTS,
} from "@/shared/helpers/endpoints";
import axiosInstance, {
  axiosInstanceMultipart,
} from "@/shared/helpers/axiosInstance";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

interface FormData {
  serviceName: string;
  ServicerName: string;
  courseName: string;
  instructorName: string;
  subject: string;
  description: string;
}

interface FormProps {
  formData: FormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

interface CourseData {
  _id: string;
  courseName: string;
  courseImage: string;
  username: string;
}

const Complaints: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "services" | "courses" | "general"
  >("services");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<CourseData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormData>({
    serviceName: "",
    ServicerName: "",
    courseName: "",
    instructorName: "",
    subject: "",
    description: "",
  });

  const FetchEnroll = async () => {
    setIsLoading(true);
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const userId = userData._id;
      try {
        const response = await axiosInstance.get(
          `${ENROLLEDCOURSES}/${userId}`
        );
        const courseData = response.data.response.map((course: any) => ({
          _id: course._id,
          courseName: course.courseName,
          courseImage: course.courseImage,
          username: course.username,
        }));
        setEnrolledCourses(courseData);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    FetchEnroll();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseSelect = (course: CourseData) => {
    setFormData((prev) => ({
      ...prev,
      courseName: course.courseName,
      instructorName: course.username,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      serviceName: "",
      ServicerName: "",
      courseName: "",
      instructorName: "",
      subject: "",
      description: "",
    });
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    submissionData.append("type", activeTab);
    if (selectedImage) {
      submissionData.append("screenshot", selectedImage);
    }

    try {
      let response;
      switch (activeTab) {
        case "services":
          response = await axiosInstanceMultipart.post(
            SERVICECOMPLAINTS,
            submissionData
          );
          break;
        case "courses":
          response = await axiosInstanceMultipart.post(
            COURSECOMPLAINTS,
            submissionData
          );
          break;
        case "general":
          response = await axiosInstanceMultipart.post(
            GENERALCOMPLAINTS,
            submissionData
          );
          break;
      }
      setSubmitMessage("Complaint/Feedback submitted successfully!");
      resetForm();
    } catch (error) {
      setSubmitMessage("Failed to submit complaint. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white p-4 sm:p-8 flex flex-col items-center">
      <header className="w-full text-center mb-8 mt-20">
        <h1 className="text-5xl sm:text-6xl font-bold text-blue-400 group">
          Al-Midan
          <div
            className="
              h-1 bg-blue-400 mx-auto mt-2 rounded-full
              w-0 group-hover:w-24 transition-all duration-300 ease-in-out
            "
          ></div>
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">
          Submit a Complaint
        </h2>
        <p className="text-gray-300 mb-6 sm:mb-8 text-center text-sm sm:text-base">
          We value your feedback. Please select the appropriate category and
          provide details about your complaint.
        </p>
        <div className="flex justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
          <TabButton
            active={activeTab === "services"}
            onClick={() => setActiveTab("services")}
          >
            Services
          </TabButton>
          <TabButton
            active={activeTab === "courses"}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </TabButton>
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
          >
            General
          </TabButton>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-4 sm:p-8 rounded-lg shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "services" && (
              <ServicesForm
                formData={formData}
                handleInputChange={handleInputChange}
              />
            )}
            {activeTab === "courses" && (
              <CoursesForm
                formData={formData}
                handleInputChange={handleInputChange}
                enrolledCourses={enrolledCourses}
                handleCourseSelect={handleCourseSelect}
                isLoading={isLoading}
              />
            )}
            {activeTab === "general" && (
              <GeneralForm
                formData={formData}
                handleInputChange={handleInputChange}
              />
            )}
            <div className="mt-6">
              <p className="mb-2 text-sm sm:text-base">
                Upload a screenshot (optional):
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors duration-300 text-sm sm:text-base"
              >
                Select Image
              </button>
              {previewUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm sm:text-base">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-300 text-sm sm:text-base"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-300 font-semibold text-sm sm:text-base disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
          {submitMessage && (
            <p
              className={`mt-4 text-center ${
                submitMessage.includes("successfully")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {submitMessage}
            </p>
          )}
        </motion.div>
        <div className="mt-8 sm:mt-12 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">
            Need immediate assistance?
          </h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Our support team is available 24/7 to help you with any urgent
            issues.
          </p>
          <a
            href="tel:+1234567890"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm sm:text-base"
          >
            Call us: +1 (234) 567-890
          </a>
        </div>
      </motion.div>
    </div>
  );
};

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    type="button"
    className={`px-4 sm:px-6 py-2 rounded-full transition-colors duration-300 text-sm sm:text-base ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const ServicesForm: React.FC<FormProps> = ({ formData, handleInputChange }) => (
  <>
    <input
      name="serviceName"
      type="text"
      value={formData.serviceName}
      onChange={handleInputChange}
      placeholder="Service Name"
      className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
    <input
      name="ServicerName"
      type="text"
      value={formData.ServicerName}
      onChange={handleInputChange}
      placeholder="ServicerName (if applicable)"
      className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
    <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder="Describe your complaint in detail"
      className="w-full p-3 bg-gray-700 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
  </>
);

const CoursesForm: React.FC<
  FormProps & {
    enrolledCourses: CourseData[];
    handleCourseSelect: (course: CourseData) => void;
    isLoading: boolean;
  }
> = ({
  formData,
  handleInputChange,
  enrolledCourses,
  handleCourseSelect,
  isLoading,
}) => (
  <>
    {isLoading ? (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select a course:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrolledCourses.map((course) => (
            <div
              key={course._id}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                formData.courseName === course.courseName
                  ? "bg-blue-600 shadow-lg transform scale-105"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => handleCourseSelect(course)}
            >
              <img
                src={course.courseImage}
                alt={course.courseName}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <h3 className="font-semibold text-sm">{course.courseName}</h3>
              <p className="text-xs text-gray-400">
                Instructor: {course.username}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
    <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder="Describe your complaint in detail"
      className="w-full p-3 bg-gray-700 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
  </>
);

const GeneralForm: React.FC<FormProps> = ({ formData, handleInputChange }) => (
  <>
    <input
      name="subject"
      type="text"
      value={formData.subject}
      onChange={handleInputChange}
      placeholder="Subject"
      className="w-full p-3 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
    <textarea
      name="description"
      value={formData.description}
      onChange={handleInputChange}
      placeholder="Describe your feedback or complaint in detail"
      className="w-full p-3 bg-gray-700 rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
    />
  </>
);

export default Complaints;
