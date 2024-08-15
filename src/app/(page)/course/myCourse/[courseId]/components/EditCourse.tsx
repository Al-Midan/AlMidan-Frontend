"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { decrypt } from "@/shared/helpers/decryptFunction";
import Image from "next/image";
import { Toaster, toast } from "sonner";
import { GETCOURSEDETAILS, UPDATECOURSE } from "@/shared/helpers/endpoints";

interface ILesson {
  _id: string;
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

const EditCourse = () => {
  const { courseId } = useParams();
  const [courseDetails, setCourseDetails] = useState<ICourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

    fetchCourseDetails();
  }, [courseId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseDetails(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSectionChange = (sectionIndex: number, field: string, value: string) => {
    setCourseDetails(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...newSections[sectionIndex], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const handleLessonChange = (sectionIndex: number, lessonIndex: number, field: string, value: string) => {
    setCourseDetails(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      const newLessons = [...newSections[sectionIndex].lessons];
      newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], lessons: newLessons };
      return { ...prev, sections: newSections };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.put(`${UPDATECOURSE}/${courseId}`, courseDetails);
      if (response.status === 200) {
        toast.success("Course updated successfully", {
          style: { background: "#1E293B", color: "white" },
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course", {
        style: { background: "#1E293B", color: "white" },
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 p-4 md:p-8">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-teal-300">Edit Course</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-teal-300 mb-1">Course Name</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={courseDetails?.courseName || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-800 rounded-md text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="courseDescription" className="block text-sm font-medium text-teal-300 mb-1">Course Description</label>
            <textarea
              id="courseDescription"
              name="courseDescription"
              value={courseDetails?.courseDescription || ""}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 rounded-md text-slate-100"
            ></textarea>
          </div>

          <div>
            <label htmlFor="courseCategory" className="block text-sm font-medium text-teal-300 mb-1">Category</label>
            <input
              type="text"
              id="courseCategory"
              name="courseCategory"
              value={courseDetails?.courseCategory || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-800 rounded-md text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="coursePrice" className="block text-sm font-medium text-teal-300 mb-1">Price</label>
            <input
              type="number"
              id="coursePrice"
              name="coursePrice"
              value={courseDetails?.coursePrice || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-800 rounded-md text-slate-100"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-teal-300">Sections</h2>
            {courseDetails?.sections.map((section, sectionIndex) => (
              <div key={section._id} className="mb-6 p-4 bg-slate-800 rounded-lg">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(sectionIndex, "title", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded-md text-slate-100 mb-2"
                  placeholder="Section Title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => handleSectionChange(sectionIndex, "description", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded-md text-slate-100 mb-4"
                  placeholder="Section Description"
                  rows={2}
                ></textarea>
                <h3 className="text-lg font-medium mb-2 text-teal-300">Lessons</h3>
                {section.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson._id} className="mb-4 p-3 bg-slate-700 rounded-md">
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "title", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 rounded-md text-slate-100 mb-2"
                      placeholder="Lesson Title"
                    />
                    <textarea
                      value={lesson.description}
                      onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "description", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 rounded-md text-slate-100 mb-2"
                      placeholder="Lesson Description"
                      rows={2}
                    ></textarea>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "isFree", e.target.checked.toString())}
                        className="mr-2"
                      />
                      <label className="text-sm text-slate-300">Free Lesson</label>
                    </div>
                    <input
                      type="text"
                      value={decrypt(lesson.video)}
                      onChange={(e) => handleLessonChange(sectionIndex, lessonIndex, "video", e.target.value)}
                      className="w-full px-3 py-2 bg-slate-600 rounded-md text-slate-100"
                      placeholder="Video URL"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white text-lg px-4 py-2 rounded-md font-semibold hover:bg-teal-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;