"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/shared/helpers/axiosInstance";
import {
  GETCOURSECOMPLAINTS,
  GETSERVICECOMPLAINTS,
  GETGENERALCOMPLAINTS,
} from "@/shared/helpers/endpoints";

interface Complaint {
  _id: string;
  courseName?: string;
  instructorName?: string;
  description: string;
  complaintPhoto?: string;
  serviceName?: string;
  ServicerName?: string;
  subject?: string;
}

const ComplaintCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"course" | "service" | "general">(
    "course"
  );
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComplaints, setExpandedComplaints] = useState<Set<string>>(
    new Set()
  );
  const complaintsPerPage = 9;

  useEffect(() => {
    fetchComplaints();
  }, [activeTab]);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = {
        course: GETCOURSECOMPLAINTS,
        service: GETSERVICECOMPLAINTS,
        general: GETGENERALCOMPLAINTS,
      }[activeTab];
      const response = await axiosInstance.get(endpoint);
      setComplaints(response.data.response);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Failed to load complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = complaints.slice(
    indexOfFirstComplaint,
    indexOfLastComplaint
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleExpand = (id: string) => {
    setExpandedComplaints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="mt-20 text-3xl sm:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Complaint Center
        </h1>

        <div className="flex justify-center mb-6 space-x-2 sm:space-x-4">
          {["course", "service", "general"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() =>
                setActiveTab(tab as "course" | "service" | "general")
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
            Loading complaints...
          </div>
        )}

        {error && (
          <div className="text-center text-xl text-red-500 mb-6">{error}</div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="text-center text-xl mb-6">
            No complaints found for this category.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-gray-800 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              {complaint.complaintPhoto && (
                <img
                  src={complaint.complaintPhoto}
                  alt="Complaint"
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h2 className="text-lg font-semibold mb-2 line-clamp-1">
                {complaint.courseName ||
                  complaint.serviceName ||
                  complaint.subject}
              </h2>
              {complaint.instructorName && (
                <p className="text-sm text-gray-400 mb-1">
                  Instructor: {complaint.instructorName}
                </p>
              )}
              {complaint.ServicerName && (
                <p className="text-sm text-gray-400 mb-1">
                  Servicer: {complaint.ServicerName}
                </p>
              )}
              <p
                className={`text-sm text-gray-300 ${
                  expandedComplaints.has(complaint._id) ? "" : "line-clamp-3"
                }`}
              >
                {complaint.description}
              </p>
              {complaint.description.length > 150 && (
                <button
                  onClick={() => toggleExpand(complaint._id)}
                  className="text-sm text-blue-400 hover:text-blue-300 mt-2 focus:outline-none"
                >
                  {expandedComplaints.has(complaint._id)
                    ? "View Less"
                    : "View More"}
                </button>
              )}
            </div>
          ))}
        </div>

        {complaints.length > complaintsPerPage && (
          <div className="flex justify-center mt-6">
            {Array.from({
              length: Math.ceil(complaints.length / complaintsPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 rounded-full text-sm ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplaintCenter;
