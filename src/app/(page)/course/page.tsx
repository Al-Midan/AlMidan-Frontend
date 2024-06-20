"use client"

import axiosInstance from "@/shared/helpers/axiosInstance";
import { GETCOURSE } from "@/shared/helpers/endpoints";
import axios from "axios";
import Link from "next/link"
import { useEffect } from "react"

const Page = () => {
  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = userData._id;
      const response = await axiosInstance.get(GETCOURSE,userId);
      console.log("response",response);
    };

    fetchData();
  }, []);
    return (
      <div className="bg-black-100 min-h-screen flex justify-center items-center">
        <button className="px-4 py-2 rounded-md text-white bg-fuchsia-600	 hover:bg-indigo-700">
          
          <Link href={'/course/addCourse'}>Add Course</Link>   

        </button>
      </div>
    )
  }
  
  export default Page 