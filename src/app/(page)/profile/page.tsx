"use client";
import axiosInstance from "@/shared/helpers/axiosInstance";
import {
  ENROLLEDDETAILS,
  GETCOURSEWITHID,
  GETENROLLEDCOURSEWITHID,
  ROLEUPDATE,
} from "@/shared/helpers/endpoints";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UserData {
  username?: string;
  roles?: string;
  _id?: string;
  profilePic?: string;
}

interface Section {
  sectionId: string;
  _id: string;
}
interface EnrolledStudent {
  email: string;
  studentName: string;
}
interface Course {
  courseCategory: string;
  courseDescription: string;
  courseImage: string;
  courseName: string;
  coursePrice: number;
  sections: Section[];
  userId: string;
  username: string;
  __v: number;
  _id: string;
  isBlock: boolean;
}
const EnrolledStudentsTable = ({ students, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentStudents.map((student, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.studentname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, students.length)}
                </span>{" "}
                of <span className="font-medium">{students.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const CoursePagination = ({ courses, itemsPerPage = 3 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);

  return (
    <div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentCourses.map((course: any) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-8 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`mx-1 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              currentPage === page
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

const CourseCard = ({ course }: { course: Course }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
    <img
      src={course.courseImage}
      alt={course.courseName}
      className="w-full h-48 object-cover"
    />
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2 text-gray-800">
        {course.courseName}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {course.courseDescription.length > 100
          ? `${course.courseDescription.substring(0, 100)}...`
          : course.courseDescription}
      </p>
      <div className="flex justify-between items-center mb-2">
        <span className="text-indigo-600 font-bold text-lg">
          ${course.coursePrice.toFixed(2)}
        </span>
        <span className="text-sm font-medium px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
          {course.courseCategory}
        </span>
      </div>
      {course.isBlock && (
        <p className="text-sm text-red-600 font-medium">
          Waiting for admin approval
        </p>
      )}
    </div>
  </div>
);

const NoCourses = () => {
  const router = useRouter();
  return (
    <div className="text-center py-16 bg-gray-50 rounded-xl">
      <p className="text-2xl text-gray-600 mb-6">
        You don&apos;t have any courses yet. 📚
      </p>
      <button
        onClick={() => router.push("/course/addCourse")}
        className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-medium hover:bg-indigo-700 transition duration-300 shadow-md"
      >
        Create Your First Course 🚀
      </button>
    </div>
  );
};

const NoEnrolledCourses = () => {
  const router = useRouter();
  return (
    <div className="text-center py-16 bg-gray-50 rounded-xl">
      <p className="text-2xl text-gray-600 mb-6">
        You haven&apos;t enrolled in any courses yet. 🎓
      </p>
      <button
        onClick={() => router.push("/course")}
        className="px-8 py-3 bg-indigo-600 text-white rounded-full text-lg font-medium hover:bg-indigo-700 transition duration-300 shadow-md"
      >
        Browse Courses 🔍
      </button>
    </div>
  );
};

const Page = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [Enrolled, setEnrolled] = useState<Course[]>([]);
  const [activeView, setActiveView] = useState("myCourses");
  const [activeRole, setActiveRole] = useState("student");
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(
    []
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndCourses = async () => {
      const storedUserData = localStorage.getItem("userData");
      console.log("storedUserData", storedUserData);

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setActiveRole(parsedUserData.roles || "student");

        if (parsedUserData._id) {
          try {
            const response = await axiosInstance.get(
              GETCOURSEWITHID.replace(":id", parsedUserData._id)
            );
            console.log("response", response.data.response);

            setMyCourses(response.data.response);
          } catch (error) {
            console.error("Error fetching courses:", error);
          }
        }
      }
    };
    const fetchMyCourseEnrolled = async () => {
      const storedUserData = localStorage.getItem("userData");
      console.log("storedUserData", storedUserData);

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);

        if (parsedUserData._id) {
          try {
            const response = await axiosInstance.get(
              ENROLLEDDETAILS.replace(":id", parsedUserData._id)
            );
            console.log("response", response.data.response);

            setEnrolledStudents(response.data.response);
          } catch (error) {
            console.error("Error fetching enrolled students:", error);
          }
        }
      }
    };

    const fetchEnrolledCourses = async () => {
      const storedUserData = localStorage.getItem("userData");
      console.log("storedUserData", storedUserData);

      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);

        if (parsedUserData._id) {
          try {
            const response = await axiosInstance.get(
              GETENROLLEDCOURSEWITHID.replace(":id", parsedUserData._id)
            );
            console.log("response 2 ", response.data.response);

            setEnrolled(response.data.response);
          } catch (error) {
            console.error("Error fetching courses:", error);
          }
        }
      }
    };

    fetchUserDataAndCourses();
    fetchMyCourseEnrolled();
    fetchEnrolledCourses();
  }, []);

  const handleRoleToggle = async (role: string) => {
    setActiveRole(role);
    try {
      const payload = { role, ...userData };
      await axiosInstance.post(ROLEUPDATE, payload);
      setUserData((prevData) => ({ ...prevData, roles: role }));
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  console.log("userData", userData);
  console.log("myCourses", myCourses);
  console.log("Enrolled", Enrolled);

  return (
    <div className="min-h-screen bg-black-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-10">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-8 bg-indigo-600 text-white">
            <h1 className="text-4xl font-bold text-center mb-6">
              Profile Page 👤
            </h1>
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center">
                <div className="relative w-24 h-24 mr-6">
                  {userData?.profilePic ? (
                    <img
                      src={userData.profilePic}
                      alt={userData.username || "Profile"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-indigo-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {userData?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-white text-indigo-600 rounded-full p-2 shadow-md">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-bold">
                    {userData?.username || "No Name"}
                  </h2>
                  <p className="text-indigo-200 text-lg">
                    {userData?.roles || "No roles found"}
                  </p>
                </div>
              </div>
              <div className="mt-6 sm:mt-0">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="font-semibold text-indigo-100">Role:</span>
                  <button
                    onClick={() => handleRoleToggle("student")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeRole === "student"
                        ? "bg-white text-indigo-600"
                        : "bg-indigo-500 text-white hover:bg-indigo-400"
                    }`}
                  >
                    Student 🎒
                  </button>
                  <button
                    onClick={() => handleRoleToggle("teacher")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeRole === "teacher"
                        ? "bg-white text-indigo-600"
                        : "bg-indigo-500 text-white hover:bg-indigo-400"
                    }`}
                  >
                    Teacher 👨‍🏫
                  </button>
                </div>
                <div className="flex gap-4">
                  {activeRole === "teacher" && (
                    <button className="px-6 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition duration-200 shadow-md">
                      Add Course ➕
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/profile/editProfile")}
                    className="px-6 py-2 rounded-full text-sm font-medium bg-white text-indigo-600 hover:bg-indigo-50 transition duration-200 shadow-md"
                  >
                    Edit Profile ✏️
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 px-6 py-8 bg-gray-50 border-r border-gray-200">
              <ul className="space-y-4">
                {[
                  { name: "My Courses", icon: "📚", view: "myCourses" },
                  {
                    name: "Enrolled Courses",
                    icon: "🎓",
                    view: "enrolledCourses",
                  },
                  { name: "Chats", icon: "💬", view: "chats" },
                  {
                    name: "Your Course Enrolled Users",
                    icon: "👥",
                    view: "yourCourseEnrolledUsers",
                  },
                  { name: "History", icon: "📅", view: "history" },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href="#"
                      className={`flex items-center py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        activeView === item.view
                          ? "bg-indigo-100 text-indigo-800"
                          : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                      onClick={() => item.view && setActiveView(item.view)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-3/4 px-6 py-8">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">
                {activeView === "myCourses"
                  ? "My Courses 📚"
                  : activeView === "enrolledCourses"
                  ? "Enrolled Courses 🎓"
                  : activeView === "yourCourseEnrolledUsers"
                  ? "Your Course Enrolled Users 👥"
                  : ""}
              </h2>
              {activeView === "myCourses" ? (
                myCourses.length > 0 ? (
                  <CoursePagination courses={myCourses} />
                ) : (
                  <NoCourses />
                )
              ) : activeView === "enrolledCourses" ? (
                Enrolled.length > 0 ? (
                  <CoursePagination courses={Enrolled} />
                ) : (
                  <NoEnrolledCourses />
                )
              ) : activeView === "yourCourseEnrolledUsers" ? (
                enrolledStudents.length > 0 ? (
                  <EnrolledStudentsTable students={enrolledStudents} />
                ) : (
                  <p className="text-center text-gray-600">
                    No enrolled students found.
                  </p>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
