"use client";
import { useState } from "react";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { ArrowLeft, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { axiosInstanceMultipart } from "@/shared/helpers/axiosInstance";
import { CREATECOURSE } from "@/shared/helpers/endpoints";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
const NewCoursePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState({
    courseName: "",
    courseDescription: "",
    courseCategory: "",
    coursePrice: "",
  });
  const router = useRouter();
  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (courseName.trim() === "") {
      newErrors.courseName = "Course name is required";
      isValid = false;
    } else {
      newErrors.courseName = "";
    }

    if (courseDescription.trim() === "") {
      newErrors.courseDescription = "Course description is required";
      isValid = false;
    } else {
      newErrors.courseDescription = "";
    }

    if (courseCategory.trim() === "") {
      newErrors.courseCategory = "Course category is required";
      isValid = false;
    } else {
      newErrors.courseCategory = "";
    }

    if (coursePrice <= 0) {
      newErrors.coursePrice = "Course price must be greater than 0";
      isValid = false;
    } else {
      newErrors.coursePrice = "";
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {
      setLoading(true);
      const loadingToastId = toast.loading("Processing", {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");

        const formData = new FormData();
        formData.append("courseName", courseName);
        formData.append("courseDescription", courseDescription);
        formData.append("courseCategory", courseCategory);
        formData.append("coursePrice", coursePrice.toString());

        if (selectedFile) {
          formData.append("courseImage", selectedFile);
        }

        formData.append("userData", JSON.stringify(userData));


        const response = await axiosInstanceMultipart.post(
          CREATECOURSE,
          formData
        );
        const Message = response.data.message;

        if (response.status === 200) {
          toast.dismiss(loadingToastId);
          toast.success(Message, {
            style: { background: "black", color: "white" },
            position: "top-center",
          });
          // Handle successful response
          setTimeout(() => {
            const courseId = response.data.newCourse._id;

            router.push(`/course/addCourse/addSection/?courseId=${courseId}`);
          }, 1000);
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
      } finally {
        setLoading(false);
      }
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-800 to-purple-800 text-[#e0e0ff]">
    <Toaster />
    <div className="flex flex-row items-center">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-20 mt-6 ml-6"
      >
        <button
          onClick={() => router.back()}
          className="pt-3 pb-2 px-3 text-[#00ccff] text-base rounded-full hover:bg-[#003366] hover:text-white transition-colors duration-300 focus:outline-none"
        >
          <ArrowLeft className="my-icon" />
        </button>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-12 pb-4 uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00ccff] via-[#cc00ff] to-[#ff00cc] font-bold text-2xl"
      >
        Create Futuristic Course
      </motion.div>
    </div>
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="p-10"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8">
          <div className="flex flex-col w-full md:w-1/2 space-y-6">
            <div>
              <label htmlFor="courseName" className="block mb-2 text-base text-[#00ccff] font-semibold">
                Course Name
              </label>
              <input
                type="string"
                id="courseName"
                onChange={(e) => setCourseName(e.target.value)}
                className="form-control text-[#e0e0ff] placeholder-[#6e6e9e] text-sm rounded-lg w-full p-3 border-2 border-solid border-[#3d3d7d] focus:border-[#00ccff] bg-[#0d0d2b] transition-colors duration-300"
                placeholder="Eg: Quantum Computing Fundamentals"
              />
              {errors.courseName && (
                <p className="text-[#ff00cc] text-sm mt-1">{errors.courseName}</p>
              )}
            </div>
            <div>
              <label htmlFor="courseDescription" className="block mb-2 text-base text-[#00ccff] font-semibold">
                Description
              </label>
              <textarea
                id="courseDescription"
                rows={4}
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                className="block font-sans font-normal text-[#e0e0ff] placeholder-[#6e6e9e] text-sm rounded-lg w-full p-3 border-2 border-solid border-[#3d3d7d] focus:border-[#00ccff] bg-[#0d0d2b] transition-colors duration-300"
                placeholder="Embark on a journey through the quantum realm..."
              ></textarea>
              {errors.courseDescription && (
                <p className="text-[#ff00cc] text-sm mt-1">{errors.courseDescription}</p>
              )}
            </div>
            <div>
              <label htmlFor="courseCategory" className="block mb-2 text-base text-[#00ccff] font-semibold">
                Category
              </label>
              <input
                type="text"
                id="courseCategory"
                value={courseCategory}
                onChange={(e) => setCourseCategory(e.target.value)}
                className="block font-sans font-normal text-[#e0e0ff] placeholder-[#6e6e9e] text-sm rounded-lg w-full p-3 border-2 border-solid border-[#3d3d7d] focus:border-[#00ccff] bg-[#0d0d2b] transition-colors duration-300"
                placeholder="Future Technologies"
              />
              {errors.courseCategory && (
                <p className="text-[#ff00cc] text-sm mt-1">{errors.courseCategory}</p>
              )}
            </div>
            <div>
              <label htmlFor="coursePrice" className="block mb-2 text-base text-[#00ccff] font-semibold">
                Price (Credits)
              </label>
              <input
                type="number"
                id="coursePrice"
                onChange={(e) => setCoursePrice(Number(e.target.value))}
                className="block font-sans font-normal text-[#e0e0ff] placeholder-[#6e6e9e] text-sm rounded-lg w-full p-3 border-2 border-solid border-[#3d3d7d] focus:border-[#00ccff] bg-[#0d0d2b] transition-colors duration-300"
                placeholder="2099"
                min={1}
              />
              {errors.coursePrice && (
                <p className="text-[#ff00cc] text-sm mt-1">{errors.coursePrice}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col w-full md:w-1/2">
            <label htmlFor="courseImage" className="block mb-2 text-base text-[#00ccff] font-semibold">
              Holographic Thumbnail
            </label>
            <div className="flex items-center justify-center w-full h-64">
              {previewUrl === null ? (
                <label
                  htmlFor="courseImage"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-[#00ccff] border-dashed rounded-lg cursor-pointer bg-[#0d0d2b] hover:bg-[#161650] transition-all duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-[#00ccff]" />
                    <p className="mb-2 text-sm text-[#00ccff]">
                      <span className="font-semibold">Upload Hologram</span>
                    </p>
                    <p className="text-xs text-[#8080b3]">4D, Holo, QuantumJPG (Max. 5QB)</p>
                  </div>
                  <input
                    id="courseImage"
                    type="file"
                    className="hidden"
                    onChange={onFileSelected}
                    accept="image/*"
                  />
                </label>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Selected"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-[#ff00cc] p-2 rounded-full text-white hover:bg-[#cc00ff] focus:outline-none transition-colors duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px #00ccff" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#00ccff] to-[#cc00ff] text-black text-sm font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none"
          >
            Launch Course
          </motion.button>
        </div>
      </form>
    </motion.div>
    {loading && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#0d0d2b] p-6 rounded-lg shadow-xl border border-[#00ccff]">
          <p className="text-[#00ccff] mb-4">Initializing Quantum Processor...</p>
          <div className="w-12 h-12 border-t-4 border-[#cc00ff] border-solid rounded-full animate-spin"></div>
        </div>
      </div>
    )}
  </div>
  );
};

export default NewCoursePage;
