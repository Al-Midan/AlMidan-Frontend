"use client"

import Link from "next/link"
import { useAppSelector } from '@/redux/hook';
import { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Home = () => {
  const user = useAppSelector((state: RootState) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  console.log('Current user state:', user);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            animation: 'twinkle 20s linear infinite'
          }}
        ></div>
      </div>

      {/* Content */}
      <motion.div 
        className="z-10 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-400">Welcome to Al-Midan</h1>
        {user._id ? (
          <motion.p 
            className="text-xl md:text-2xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Greetings, <span className="text-green-400">{user.username}</span>! Ready to explore the future?
          </motion.p>
        ) : (
          <motion.p 
            className="text-xl md:text-2xl mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Embark on a journey through the digital realm. <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">Log in</Link> to begin.
          </motion.p>
        )}

        {/* Call to action button */}
        <motion.button
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors duration-300 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {user._id ? "Explore Now" : "Learn More"}
        </motion.button>
      </motion.div>

      {/* Futuristic elements */}
      <div className="absolute bottom-10 left-10 w-20 h-20 border-2 border-blue-400 rounded-full animate-pulse"></div>
      <div className="absolute top-10 right-10 w-16 h-16 border-2 border-green-400 rounded-full animate-ping"></div>

      {/* Inline styles for custom animation */}
      <style jsx>{`
        @keyframes twinkle {
          0% { transform: translateY(0); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}

export default Home;