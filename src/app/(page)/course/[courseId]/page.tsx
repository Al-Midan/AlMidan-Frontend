"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { BUYCOURSE, CHECKUSERCOURSEACCESS, GETCOURSEDETAILS } from "@/shared/helpers/endpoints";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import useRazorpay from "@/shared/hooks/useRazorpay";

interface ILesson {
  title: string;
  description: string;
  isFree: boolean;
  video: string;
}

interface ISection {
  _id: string;
  title: string;
  description: string;
  lessons: ILesson[];
}

interface ICourseDetails {
  username: string;
  userId?: string;
  courseName: string;
  courseDescription: string;
  courseCategory: string;
  coursePrice: number;
  courseImage: string;
  sections: ISection[];
}

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const isRazorpayLoaded = useRazorpay();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [userData, setUserData] = useState(null);
  const [userStatus, setUserStatus] = useState<"Not Enrolled" | "Enrolled" | "Owner" | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
  
    const checkUserCourseAccess = async (parsedUserData: any) => {
      try {
        const userStatusResponse = await axiosInstance.post(CHECKUSERCOURSEACCESS, {
          courseId: courseId,
          userData: parsedUserData
        });
        if (userStatusResponse.status === 200) {
          setUserStatus(userStatusResponse.data.response);
        }
      } catch (error) {
        console.error("Error checking user course access:", error);
      }
    };
  
    const fetchCourseDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`${GETCOURSEDETAILS}/${courseId}`);
        if (response.status === 200) {
          setCourseDetails(response.data.courseDetails);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Error loading course details", {
          style: { background: "#1E293B", color: "white" },
          position: "top-center",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
      checkUserCourseAccess(parsedUserData);
    }
  
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);
  

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId);
  };

  const handleLessonClick = (lesson: ILesson) => {
    if (userStatus === "Owner" || userStatus === "Enrolled" || lesson.isFree) {
      setSelectedLesson(lesson);
    } else {
      toast.error("Please enroll to access this lesson", {
        style: { background: "#1E293B", color: "white" },
        position: "top-center",
      });
    }
  };

  const handleReturnToThumbnail = () => {
    setSelectedLesson(null);
  };

  const handleEnrollClick = async () => {
    console.log('Preparing Razorpay options...'); 
    if (!isRazorpayLoaded) {
      console.error('Razorpay SDK is not loaded yet');
      return;
    }

    try {
      setIsEnrolling(true);
      const options = {
        key: "rzp_test_BKgZJwO5Jn8JWR",
        amount: courseDetails!.coursePrice * 100, 
        currency: "INR",
        name: "AlMidan",
        description: "Course Enrollment",
        handler: async (response: any) => {
          try {
            console.log('Preparing Razorpay options...'); 
            const res = await axiosInstance.post(BUYCOURSE, {
              userData,
              ...courseDetails,
              razorpay_payment_id: response.razorpay_payment_id,
            });
            if (res.status === 200) {
              setUserStatus("Enrolled");
              toast.success("Successfully enrolled in the course!", {
                style: { background: "#1E293B", color: "white" },
                position: "top-center",
              });
            }
          } catch (error) {
            console.error("Error in payment handler:", error);
          }
        },
        theme: {
          color: "#0F172A"
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error in handleEnrollClick:", error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const LoadingPlaceholder = () => (
    <div className="animate-pulse">
      <div className="bg-slate-700 h-48 w-full mb-3 rounded-md"></div>
      <div className="h-6 bg-slate-700 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-slate-700 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-slate-700 rounded-md w-5/6 mb-2"></div>
      <div className="h-4 bg-slate-700 rounded-md w-4/6 mb-3"></div>
      <div className="h-8 bg-slate-700 rounded-md w-full mb-3"></div>
      <div className="h-32 bg-slate-700 rounded-md w-full"></div>
    </div>
  );

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 mt-12 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2">
            <div className={`bg-slate-800 rounded-lg shadow-lg overflow-hidden ${isLoading ? 'blur-sm' : ''}`}>
              {isLoading ? (
                <LoadingPlaceholder />
              ) : (
                <>
                  {selectedLesson ? (
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        src={selectedLesson.video}
                        title={selectedLesson.title}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <Image
                      src={courseDetails?.courseImage || ''}
                      alt={courseDetails?.courseName || ''}
                      width={800}
                      height={400}
                      className="w-full h-auto object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4 text-teal-300">
                      {courseDetails?.courseName}
                    </h1>
                    <p className="text-base mb-4 text-slate-300">{courseDetails?.courseDescription}</p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-teal-400">Instructor: {courseDetails?.username}</p>
                      <p className="text-sm text-teal-400">Category: {courseDetails?.courseCategory}</p>
                    </div>
                    {selectedLesson && (
                      <div className="mt-4 bg-slate-700 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-teal-300">
                          {selectedLesson.title}
                        </h3>
                        <p className="text-sm text-slate-300">{selectedLesson.description}</p>
                        <button
                          onClick={handleReturnToThumbnail}
                          className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
                        >
                          Return to Course Overview
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-1">
            <div className={`bg-slate-800 rounded-lg shadow-lg p-6 mb-6 ${isLoading ? 'blur-sm' : ''}`}>
              {isLoading ? (
                <LoadingPlaceholder />
              ) : (
                <>
                  <p className="text-2xl font-bold mb-4 text-teal-300">
                    ${courseDetails?.coursePrice}
                  </p>
                  {userStatus !== "Enrolled" && userStatus !== "Owner" && (
                    <button 
                      className="w-full bg-teal-600 text-white text-base px-4 py-2 rounded-md font-semibold hover:bg-teal-700 transition"
                      onClick={handleEnrollClick} 
                      disabled={!isRazorpayLoaded || isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )}
                  {userStatus === "Enrolled" && (
                    <p className="text-green-400 font-semibold">You are enrolled in this course</p>
                  )}
                  {userStatus === "Owner" && (
                    <p className="text-blue-400 font-semibold">You are the owner of this course</p>
                  )}
                </>
              )}
            </div>

            <div className={`bg-slate-800 rounded-lg shadow-lg p-6 ${isLoading ? 'blur-sm' : ''}`}>
              <h2 className="text-xl font-bold mb-4 text-teal-300">Course Content</h2>
              {isLoading ? (
                <LoadingPlaceholder />
              ) : (
                courseDetails?.sections.map((section) => (
                  <div key={section._id} className="mb-4">
                    <button
                      className="w-full text-left bg-slate-700 p-3 rounded-md hover:bg-slate-600 transition"
                      onClick={() => handleSectionClick(section._id)}
                    >
                      <h3 className="text-base font-semibold text-teal-300">
                        {section.title}
                      </h3>
                    </button>
                    {selectedSection === section._id && (
                      <div className="mt-2 ml-4">
                        <p className="text-sm mb-2 text-slate-300">
                          {section.description}
                        </p>
                        <ul className="space-y-2">
                          {section.lessons.map((lesson, index) => (
                            <li
                              key={index}
                              className={`cursor-pointer hover:bg-slate-700 p-2 rounded-md transition ${
                                userStatus === "Owner" || userStatus === "Enrolled" || lesson.isFree ? "" : "opacity-70"
                              }`}
                              onClick={() => handleLessonClick(lesson)}
                            >
                              <div className="flex items-center">
                                <span
                                  className={`mr-2 text-base ${
                                    userStatus === "Owner" || userStatus === "Enrolled" || lesson.isFree
                                      ? "text-green-400"
                                      : "text-yellow-400"
                                  }`}
                                >
                                  {userStatus === "Owner" || userStatus === "Enrolled" || lesson.isFree ? "🔓" : "🔒"}
                                </span>
                                <span className="text-sm font-medium text-teal-300">
                                  {lesson.title}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-1 ml-6">
                                {lesson.description}
                              </p>
                              {userStatus === "Not Enrolled" && !lesson.isFree && (
                                <p className="text-xs text-yellow-400 mt-1 ml-6">
                                  This lesson is locked. Enroll to access.
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;