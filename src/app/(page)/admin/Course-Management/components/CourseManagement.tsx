"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import axiosInstance from '@/shared/helpers/axiosInstance';
import { COURSEBLOCK, GETALLCOURSE } from '@/shared/helpers/endpoints';
import { useRouter } from 'next/navigation';
interface Course {
  _id: string;
  title: string;
  description: string;
  sections: any[];
  username: string;
  owner: string;
  courseId: string;
  isBlock: boolean;
  courseImage: string;
}

const CoursesPage = () => {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get(GETALLCOURSE);
        setCourses(response.data.allCourse);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleBlockToggle = async (courseId: string, isBlock: boolean) => {
    try {
      await axiosInstance.put(`${COURSEBLOCK}/${courseId}`, { isBlock: !isBlock });
            setCourses(courses.map(course => 
        course._id === courseId ? { ...course, isBlock: !isBlock } : course
      ));
    } catch (error) {
      console.error('Error toggling block status:', error);
    }
  };
  const courseView = async (courseId:string)=>{
    try {
      router.push(`Course-Management/${courseId}`)
    } catch (error) {
     console.error("An error occurred while Going to Course Details Page Admin", error);
    }
  }

  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(courses.length / coursesPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 sm:mb-8 md:mb-12 text-left text-gray-100">Admin Course Management</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {currentCourses.map((course) => (
          <motion.div 
            key={course._id}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <img 
                src={course.courseImage} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
              <h2 className="absolute bottom-2 left-3 text-lg sm:text-xl font-semibold text-white">{course.title}</h2>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-gray-300 mb-3 text-sm sm:text-base line-clamp-2">{course.description}</p>
              <p className="text-xs sm:text-sm text-gray-400">Created by: {course.username}</p>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">Sections: {course.sections.length}</p>
              <div className="flex justify-between items-center space-x-3">
                <button onClick={()=>courseView(course._id)} className="flex-grow px-3 py-1.5 bg-indigo-500 bg-opacity-20 text-indigo-300 rounded-full text-sm transition duration-200 hover:bg-opacity-30">
                  View Details
                </button>
                <button 
                  className={`flex-grow px-3 py-1.5 rounded-full text-sm transition duration-200 ${
                    course.isBlock 
                      ? 'bg-green-500 bg-opacity-20 text-green-300 hover:bg-opacity-30' 
                      : 'bg-red-500 bg-opacity-20 text-red-300 hover:bg-opacity-30'
                  }`}
                  onClick={() => handleBlockToggle(course._id, course.isBlock)}
                >
                  {course.isBlock ? 'Approve' : 'Block'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-8 sm:mt-10 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition duration-200 ${
                currentPage === i + 1 
                  ? 'bg-indigo-500 bg-opacity-30 text-indigo-200' 
                  : 'bg-gray-700 bg-opacity-30 text-gray-300 hover:bg-opacity-50'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;