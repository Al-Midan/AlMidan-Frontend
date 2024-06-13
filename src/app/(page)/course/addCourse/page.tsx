"use client";
import { useState } from "react";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { MultiStepLoader as Loader } from "../../../../components/ui/multi-step-loader";
const NewCoursePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    courseName: "",
    courseDescription: "",
    courseCategory: "",
    coursePrice: "",
  });

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
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
      const response = await axios.post("http://localhost:5002/course-service/createCourse");
      if (response.status === 200) {
        setLoading(true);
      }
      console.log(response);
    }
  };

  return (
    <div className="bg-black text-gray-800">
      <div className="flex flex-row">
        <div className="w-20 mt-6 ml-6">
          <Link
            href={"/course"}
            className=" pt-3 pb-2 px-3 text-blue-600 text-base rounded-full hover:cursor-pointer border-none border-blue-100  focus:outline-none"
          >
            <ArrowLeft className="my-icon" />
          </Link>
        </div>
        <div className="pt-12 pb-4 uppercase tracking-wide text-blue-600 font-semibold text-xl">
          New Course
        </div>
      </div>
      <div className="p-10">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-row">
            <div className="flex flex-col w-1/2 p-2">
              <div>
                <label htmlFor="courseName" className="block mb-2 text-base text-gray-800 font-semibold">
                  Course name
                </label>
                <input
                  type="string"
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="form-control text-gray-800 placeholder-gray-400 text-sm rounded-lg w-full p-3 border-2 border-solid border-gray-700 focus:border-blue-800 bg-black-100"
                  placeholder="Eg: Web Development"
                  
                />
                {errors.courseName && <p className="text-red-500 text-sm mt-1">{errors.courseName}</p>}
              </div>
              <div className="mt-5">
                <label htmlFor="courseDescription" className="block mb-2 text-base text-gray-800 font-semibold">
                  Description
                </label>
                <textarea
                  id="courseDescription"
                  rows={4}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="block font-sans font-normal text-gray-800 placeholder-gray-400 text-sm rounded-lg w-full p-3 border-2 border-solid border-gray-700 focus:border-blue-500 bg-black-100"
                  placeholder="This course is..."
                ></textarea>
                {errors.courseDescription && <p className="text-red-500 text-sm mt-1">{errors.courseDescription}</p>}
              </div>
              <div className="mt-5">
                <label htmlFor="courseCategory" className="block mb-2 text-base text-gray-800 font-semibold">
                  Category
                </label>
                <input
                  type="text"
                  id="courseCategory"
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="block font-sans font-normal text-gray-800 placeholder-gray-400 text-sm rounded-lg w-full p-3 border-2 border-solid border-gray-700 focus:border-blue-500 bg-black-100"
                  placeholder="Enter category"
                  
                />
                {errors.courseCategory && <p className="text-red-500 text-sm mt-1">{errors.courseCategory}</p>}
              </div>
              <div className="mt-5">
                <label htmlFor="coursePrice" className="block mb-2 text-base text-gray-800 font-semibold">
                  Price
                </label>
                <input
                  type="number"
                  id="coursePrice"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(Number(e.target.value))}
                  className="block font-sans font-normal text-gray-500 placeholder-gray-400 text-sm rounded-lg w-full p-3 border-2 border-solid border-gray-700 focus:border-blue-500 bg-black-100"
                  placeholder="1000"
                  min={1}
                />
                {errors.coursePrice && <p className="text-red-500 text-sm mt-1">{errors.coursePrice}</p>}
              </div>
            </div>
            <div className="flex flex-col w-1/2 p-2">
              <label htmlFor="courseImage" className="block mb-2 text-base text-gray-800 font-semibold">
                Thumbnail image
              </label>
              <div className="flex items-center justify-center w-full">
                {previewUrl === null ? (
                  <label
                    htmlFor="courseImage"
                    className="flex flex-col items-center justify-center w-full border-2 border-gray-700 border-dashed rounded-lg cursor-pointer bg-black-100 hover:bg-gray-600 hover:border-gray-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 mb-2 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload image</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG</p>
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
                  <div className="flex flex-row p-4 items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-400">
                    <div className="w-1/2">
                      <img
                        src={previewUrl}
                        alt="Selected"
                        className="w-full h-auto object-contain rounded-md"
                      />
                    </div>
                    <button
                      onClick={removeImage}
                      className="mt-28 ml-4 bg-red-500 pt-3 pb-2 px-3 text-white text-base rounded-full hover:cursor-pointer border-none border-red-600 hover:bg-red-600 focus:outline-none"
                    >
                      <Trash2 className="my-icon" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="w-20 mt-6 mr-8">
              

              
            <button
                      className="bg-[#6de741] hover:bg-[#39C3EF]/90 text-black mx-auto text-sm md:text-base transition font-medium duration-200 h-10 rounded-lg px-10 flex items-center justify-center"
                      style={{
                        boxShadow:
                          "0px -1px 0px 0px #ffffff40 inset, 0px 1px 0px 0px #ffffff40 inset",
                      }}
                    >
                      Verify Account
                    </button>
                    {loading && (
                      <button
                        className="fixed top-4 right-4 text-black dark:text-white z-[120]"
                        onClick={() => setLoading(false)}
                      >
                        <IconSquareRoundedX className="h-10 w-10" />
                      </button>
                    )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCoursePage;