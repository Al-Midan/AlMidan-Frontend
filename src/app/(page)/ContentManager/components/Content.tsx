"use client"

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaBriefcase, FaPencilAlt } from 'react-icons/fa';

const Content = () => {
  const items = [
    { title: 'Course Creation', href: '/course/addCourse', icon: FaGraduationCap },
    { title: 'Job Creation', href: '/service/createJob', icon: FaBriefcase },
    { title: 'Skilled Post Creation', href: '/service/createSkill', icon: FaPencilAlt },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full space-y-12">
        <div className="text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-6 text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 sm:text-6xl md:text-7xl"
          >
            Create Your Future
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-xl text-blue-200"
          >
            Choose your path and start building today
          </motion.p>
        </div>
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, zIndex: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={item.href}>
                  <div className="group relative bg-gray-800 bg-opacity-30 rounded-xl shadow-2xl overflow-hidden hover:bg-opacity-50 transition-all duration-300 ease-in-out p-8 h-full border border-purple-500 border-opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white mb-6 mx-auto">
                      <item.icon className="text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">{item.title}</h3>
                    <p className="text-blue-200 text-center">Click to start creating your {item.title.toLowerCase()}</p>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;