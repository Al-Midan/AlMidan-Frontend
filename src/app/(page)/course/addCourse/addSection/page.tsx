"use client";
import React, { useState } from "react";
import { axiosInstanceMultipart } from "@/shared/helpers/axiosInstance";
import { CREATESECTION } from "@/shared/helpers/endpoints";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import axios from "axios";
interface Lesson {
  title: string;
  description: string;
  video: string | File;
  isFree: boolean;
}

interface Section {
  title: string;
  description: string;
  lessons: Lesson[];
}

const AddCourse: React.FC = () => {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  console.log("CourseId", courseId);
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  );

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideo, setLessonVideo] = useState<string | File>("");
  const [isFree, setIsFree] = useState(false);

  const [errors, setErrors] = useState({
    sectionTitle: "",
    sectionDescription: "",
    lessonTitle: "",
    lessonDescription: "",
    lessonVideo: "",
  });

  const handleAddSection = () => {
    if (!sectionTitle || !sectionDescription) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        sectionTitle: !sectionTitle ? "Section title is required." : "",
        sectionDescription: !sectionDescription
          ? "Section description is required."
          : "",
      }));
      return;
    }
    const newSection: Section = {
      title: sectionTitle,
      description: sectionDescription,
      lessons: [],
    };
    setSections([...sections, newSection]);
    setSectionTitle("");
    setSectionDescription("");
    setErrors((prevErrors) => ({
      ...prevErrors,
      sectionTitle: "",
      sectionDescription: "",
    }));
  };

  const handleEditSection = (index: number) => {
    setSectionTitle(sections[index].title);
    setSectionDescription(sections[index].description);
    setCurrentSectionIndex(index);
  };

  const handleSaveSection = () => {
    if (currentSectionIndex !== null) {
      const updatedSections = [...sections];
      updatedSections[currentSectionIndex].title = sectionTitle;
      updatedSections[currentSectionIndex].description = sectionDescription;
      setSections(updatedSections);
      setCurrentSectionIndex(null);
      setSectionTitle("");
      setSectionDescription("");
    } else {
      handleAddSection();
    }
  };

  const handleDeleteSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
  };

  const handleAddLesson = () => {
    if (!lessonTitle || !lessonDescription || !lessonVideo) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        lessonTitle: !lessonTitle ? "Lesson title is required." : "",
        lessonDescription: !lessonDescription
          ? "Lesson description is required."
          : "",
        lessonVideo: !lessonVideo ? "Lesson video is required." : "",
      }));
      return;
    }
    const newLesson: Lesson = {
      title: lessonTitle,
      description: lessonDescription,
      video: lessonVideo,
      isFree,
    };
    if (currentSectionIndex !== null) {
      const updatedSections = [...sections];
      updatedSections[currentSectionIndex].lessons.push(newLesson);
      setSections(updatedSections);
    }
    setIsModalOpen(false);
    resetLessonForm();
  };

  const handleEditLesson = (sectionIndex: number, lessonIndex: number) => {
    const lesson = sections[sectionIndex].lessons[lessonIndex];
    setCurrentSectionIndex(sectionIndex);
    setCurrentLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description);
    setLessonVideo(lesson.video);
    setIsFree(lesson.isFree);
    setIsModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (currentSectionIndex !== null && currentLesson !== null) {
      const updatedSections = [...sections];
      const lessonIndex = updatedSections[
        currentSectionIndex
      ].lessons.findIndex((lesson) => lesson === currentLesson);
      updatedSections[currentSectionIndex].lessons[lessonIndex] = {
        title: lessonTitle,
        description: lessonDescription,
        video: lessonVideo,
        isFree,
      };
      setSections(updatedSections);
      setCurrentLesson(null);
      setIsModalOpen(false);
      resetLessonForm();
    } else {
      handleAddLesson();
    }
  };

  const handleDeleteLesson = (sectionIndex: number, lessonIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lessons = updatedSections[
      sectionIndex
    ].lessons.filter((_, i) => i !== lessonIndex);
    setSections(updatedSections);
  };

  const resetLessonForm = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideo("");
    setIsFree(false);
    setErrors((prevErrors) => ({
      ...prevErrors,
      lessonTitle: "",
      lessonDescription: "",
      lessonVideo: "",
    }));
  };

  const handleSubmitCourse = async () => {
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const payload = {
        userData,
        sections,
        courseId,
      };

      console.log("userData", userData);
      console.log("sections", sections);
      const response = await axiosInstanceMultipart.post(
        CREATESECTION,
        payload
      );
      console.log("response", response);
      const Message = response.data.message;
      if (response.status === 200) {
        toast.dismiss(loadingToastId);
        toast.success(Message, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.dismiss(loadingToastId);
        const errorMessage = error.response.data.message;
        toast.error(errorMessage, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      } else {
        toast.dismiss(loadingToastId);
        console.error("Error creating course:", error);
        toast.error("Error creating course:", {
          style: { background: "black", color: "white" },
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-neutral-600	rounded-lg mt-48 mb-16">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 text-white">
        Add Course Sections{" "}
      </h1>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-white">
          Section Title{" "}
        </label>
        <input
          type="text"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          className={`w-full p-2 border rounded ${
            errors.sectionTitle ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.sectionTitle && (
          <p className="text-red-500 text-sm mt-1">{errors.sectionTitle}</p>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-white">
          Section Description
        </label>
        <textarea
          value={sectionDescription}
          onChange={(e) => setSectionDescription(e.target.value)}
          className={`w-full p-2 border rounded ${
            errors.sectionDescription ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.sectionDescription && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sectionDescription}
          </p>
        )}
      </div>
      <button
        onClick={handleSaveSection}
        className="bg-teal-700 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {currentSectionIndex !== null ? "Save Section" : "Add Section"}
      </button>

      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="border border-gray-300 p-4 rounded my-4 "
        >
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p>{section.description}</p>
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => handleEditSection(sectionIndex)}
              className=" bg-fuchsia-500	 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteSection(sectionIndex)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
          <h3 className="text-lg font-semibold mt-4">Lessons</h3>
          <button
            onClick={() => {
              setCurrentSectionIndex(sectionIndex);
              setIsModalOpen(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600"
          >
            Add Lesson
          </button>
          {section.lessons.map((lesson, lessonIndex) => (
            <div
              key={lessonIndex}
              className="border border-gray-300 p-3 rounded my-2"
            >
              <h4 className="text-md font-semibold">{lesson.title}</h4>
              <p>{lesson.description}</p>
              <video
                src={
                  typeof lesson.video === "string"
                    ? lesson.video
                    : URL.createObjectURL(lesson.video)
                }
                controls
                className=" mt-2 rounded h-60 "
              />{" "}
              <p>{lesson.isFree ? "Free" : "Paid"}</p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEditLesson(sectionIndex, lessonIndex)}
                  className="bg-fuchsia-600	 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteLesson(sectionIndex, lessonIndex)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={handleSubmitCourse}
        className="bg-cyan-600	 text-white mx-5 px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit Course
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className=" p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Add/Edit Lesson</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Lesson Title
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className={`w-full p-2 border rounded ${
                  errors.lessonTitle ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.lessonTitle && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lessonTitle}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Lesson Description
              </label>
              <textarea
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                className={`w-full p-2 border rounded ${
                  errors.lessonDescription
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.lessonDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lessonDescription}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Lesson Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLessonVideo(file);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded"
              />
              {lessonVideo && (
                <video
                  src={
                    typeof lessonVideo === "string"
                      ? lessonVideo
                      : URL.createObjectURL(lessonVideo)
                  }
                  controls
                  className="w-full mt-2 rounded"
                />
              )}
              {errors.lessonVideo && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.lessonVideo}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="mr-2"
                />
                Free Lesson
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveLesson}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save Lesson
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetLessonForm();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
