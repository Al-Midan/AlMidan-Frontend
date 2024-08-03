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
  studentname: string;
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
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <motion.div
      className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const EnrolledStudentsTable: React.FC<{
  students: EnrolledStudent[];
  itemsPerPage?: number;
}> = ({ students, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  return (
    <div className="bg-gray-900 shadow-xl rounded-lg overflow-hidden border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-800">
          {currentStudents.map((student, index) => (
            <tr
              key={index}
              className="hover:bg-gray-800 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                {student.studentname}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {student.email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-t border-gray-800">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">
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
                          ? "z-10 bg-gray-700 border-gray-600 text-blue-300"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
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

const CoursePagination: React.FC<{
  courses: Course[];
  itemsPerPage?: number;
}> = ({ courses, itemsPerPage = 3 }) => {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course: Course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex justify-center">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`mx-1 px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};
const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
  <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 border border-gray-800">
    <img
      src={course.courseImage}
      alt={course.courseName}
      className="w-full h-40 object-cover"
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2 text-gray-100 truncate">
        {course.courseName}
      </h3>
      <p className="text-sm text-gray-400 mb-3 h-12 overflow-hidden">
        {course.courseDescription.length > 80
          ? `${course.courseDescription.substring(0, 80)}...`
          : course.courseDescription}
      </p>
      <div className="flex justify-between items-center mb-3">
        <span className="text-blue-400 font-bold">
          ${course.coursePrice.toFixed(2)}
        </span>
        <span className="text-xs font-medium px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
          {course.courseCategory}
        </span>
      </div>
      {course.isBlock && (
        <p className="text-xs text-red-400 font-medium mb-2">
          Waiting for admin approval
        </p>
      )}
      <Link
        href={`/course/${course._id}`}
        className="block w-full text-center px-4 py-2 bg-gray-800 text-blue-300 rounded-md hover:bg-gray-700 transition-colors duration-200"
      >
        View Course
      </Link>
    </div>
  </div>
);

const NoCourses: React.FC = () => {
  const router = useRouter();
  return (
    <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
      <p className="text-xl text-gray-300 mb-6">
        You don&apos;t have any courses yet. 📚
      </p>
      <button
        onClick={() => router.push("/course/addCourse")}
        className="px-6 py-2 bg-gray-800 text-blue-300 rounded-md text-lg font-medium hover:bg-gray-700 transition duration-300 shadow-md"
      >
        Create Your First Course 🚀
      </button>
    </div>
  );
};

const NoEnrolledCourses: React.FC = () => {
  const router = useRouter();
  return (
    <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
      <p className="text-xl text-gray-300 mb-6">
        You haven&apos;t enrolled in any courses yet. 🎓
      </p>
      <button
        onClick={() => router.push("/course")}
        className="px-6 py-2 bg-gray-800 text-blue-300 rounded-md text-lg font-medium hover:bg-gray-700 transition duration-300 shadow-md"
      >
        Browse Courses 🔍
      </button>
    </div>
  );
};

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [Enrolled, setEnrolled] = useState<Course[]>([]);
  const [activeView, setActiveView] = useState("myCourses");
  const [activeRole, setActiveRole] = useState("student");
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const storedUserData = localStorage.getItem("userData");

      if (storedUserData) {
        const parsedUserData: UserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
        setActiveRole(parsedUserData.roles || "student");

        if (parsedUserData._id) {
          try {
            const [coursesResponse, enrolledResponse, studentsResponse] =
              await Promise.all([
                axiosInstance.get(
                  GETCOURSEWITHID.replace(":id", parsedUserData._id)
                ),
                axiosInstance.get(
                  GETENROLLEDCOURSEWITHID.replace(":id", parsedUserData._id)
                ),
                axiosInstance.get(
                  ENROLLEDDETAILS.replace(":id", parsedUserData._id)
                ),
              ]);

            setMyCourses(coursesResponse.data.response);
            setEnrolled(enrolledResponse.data.response);
            setEnrolledStudents(studentsResponse.data.response);
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      }
      setIsLoading(false);
    };

    fetchData();
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 shadow-2xl rounded-lg overflow-hidden border border-gray-800">
          <div className="px-6 py-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <h1 className="text-3xl font-bold text-center mb-6">
              Profile Page 👤
            </h1>
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center">
                <div className="relative w-20 h-20 mr-4">
                  {userData?.profilePic ? (
                    <img
                      src={userData.profilePic}
                      alt={userData.username || "Profile"}
                      className="w-full h-full rounded-full object-cover border-2 border-blue-400"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-400">
                      {userData?.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-gray-800 text-blue-300 rounded-full p-1 shadow-md hover:bg-gray-700 transition-colors duration-200">
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
                  <h2 className="text-2xl font-bold text-gray-100">
                    {userData?.username || "No Name"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {userData?.roles || "No roles found"}
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-400 text-sm">
                    Role:
                  </span>
                  <button
                    onClick={() => handleRoleToggle("student")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeRole === "student"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-blue-800"
                    }`}
                  >
                    Student 🎒
                  </button>
                  <button
                    onClick={() => handleRoleToggle("teacher")}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      activeRole === "teacher"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-blue-800"
                    }`}
                  >
                    Teacher 👨‍🏫
                  </button>
                </div>
                <div className="flex gap-4">
                  {activeRole === "teacher" && (
                    <button
                      onClick={() => router.push(`/course/addCourse`)}
                      className="px-6 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition duration-200 shadow-md"
                    >
                      Add Course ➕
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/profile/editProfile")}
                    className="px-6 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow-md"
                  >
                    Edit Profile ✏️
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/4 px-6 py-8 bg-gray-800 border-r border-gray-700">
              <ul className="space-y-4">
                {[
                  { name: "My Courses", icon: "📚", view: "myCourses" },
                  {
                    name: "Enrolled Courses",
                    icon: "🎓",
                    view: "enrolledCourses",
                  },
                  {
                    name: "Course Attendees",
                    icon: "👥",
                    view: "yourCourseEnrolledUsers",
                  },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href="#"
                      className={`flex items-center py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        activeView === item.view
                          ? "bg-blue-800 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
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
            <div className="w-full md:w-3/4 px-6 py-8 bg-gray-900">
              <h2 className="text-3xl font-bold mb-8 text-gray-100">
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
                  <p className="text-center text-gray-400">
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

export default Profile;
