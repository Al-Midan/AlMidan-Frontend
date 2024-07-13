"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '@/shared/helpers/axiosInstance';
import { GETCOURSECOMPLAINTS } from '@/shared/helpers/endpoints';

const Complaint = () => {
  const [activeTab, setActiveTab] = useState('course');
  const [complaints, setComplaints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const complaintsPerPage = 5;

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await axiosInstance.get(GETCOURSECOMPLAINTS);
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const indexOfLastComplaint = currentPage * complaintsPerPage;
  const indexOfFirstComplaint = indexOfLastComplaint - complaintsPerPage;
  const currentComplaints = complaints.slice(indexOfFirstComplaint, indexOfLastComplaint);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-black-100 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Complaint Center
        </h1>

        <div className="flex justify-center mb-8">
          {['course', 'service', 'general'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-full text-lg font-semibold mr-4 transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentComplaints.map((complaint, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-6 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              {complaint.complaintPhoto && (
                <img
                  src={complaint.complaintPhoto}
                  alt="Complaint"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{complaint.courseName || 'N/A'}</h2>
              <p className="text-gray-400 mb-2">Instructor: {complaint.instructorName || 'N/A'}</p>
              <p className="text-gray-300">{complaint.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.ceil(complaints.length / complaintsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`mx-1 px-4 py-2 rounded-full ${
                currentPage === index + 1
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Complaint;