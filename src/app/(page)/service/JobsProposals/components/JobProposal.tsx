"use client";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { GetAllProposals, GETOURJOBPOST } from "@/shared/helpers/endpoints";
import React, { useEffect, useState } from "react";

interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: number;
  paymentType: string;
  duration: string;
  username: string;
  email: string;
  experienceLevel: string;
  postedDate: string;
  deadline: string;
  status: string;
  image: string;
}

const JobProposal: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== 'undefined') {
        const userDetails = localStorage.getItem("userData");
        const user = userDetails ? JSON.parse(userDetails) : {};
        const userId = user._id;

        if (userId) {
          try {
            const response = await axiosInstance.get<{ response: Job[] }>(`${GETOURJOBPOST}/${userId}`);
            setJobs(response.data.response);
          } catch (error) {
            console.error("Error fetching job post:", error);
          }
        }
      }
    };

    fetchData();
    const fetchProposal = async () => {
     
        

       
          try {
            const response = await axiosInstance.get(GetAllProposals);
            setJobs(response.data.response);
          } catch (error) {
            console.error("Error fetching job post:", error);
          }
        
      
    };

    fetchProposal();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-sans">
      <h1 className="text-4xl mb-8 text-center text-cyan-400">Job Proposals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job) => (
          <div key={job._id} className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl mb-4 text-cyan-400">{job.title}</h2>
            <p className="text-sm mb-4">{job.description}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <span className="text-xs text-gray-400">Category: {job.category}</span>
              <span className="text-xs text-gray-400">Budget: ${job.budget}</span>
              <span className="text-xs text-gray-400">Duration: {job.duration}</span>
              <span className="text-xs text-gray-400">Status: {job.status}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.skillsRequired.map((skillString, index) => {
                try {
                  const skills = JSON.parse(skillString);
                  return skills.map((skill: string, skillIndex: number) => (
                    <span
                      key={`${index}-${skillIndex}`}
                      className="bg-cyan-400 text-gray-900 px-2 py-1 rounded-full text-xs"
                    >
                      {skill.replace(/'/g, '')}
                    </span>
                  ));
                } catch (error) {
                  console.error("Error parsing skills:", error);
                  return (
                    <span
                      key={index}
                      className="bg-cyan-400 text-gray-900 px-2 py-1 rounded-full text-xs"
                    >
                      {skillString}
                    </span>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobProposal;