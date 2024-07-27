"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, SubmitHandler, UseFormRegister, FieldError } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast, Toaster } from "sonner";
import { FaUser, FaEnvelope, FaBriefcase, FaStar, FaClock, FaImage } from "react-icons/fa";
import { axiosInstanceMultipart } from "@/shared/helpers/axiosInstance";
import { CREATESKILL } from "@/shared/helpers/endpoints";

const skillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  proficiency: z.enum(["Beginner", "Intermediate", "Expert"]),
  yearsOfExperience: z.coerce.number().min(1, "At least 1 year of experience is required"),
  availability: z.enum(["Full-time", "Part-time", "Freelance"]),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  image: z.instanceof(File).optional().refine(
    (file) => !file || file.size <= 5 * 1024 * 1024,
    "Image must be 5MB or less"
  ),
});

type SkillFormData = z.infer<typeof skillSchema>;

const AddSkillPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setValue,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<SkillFormData> = async (data) => {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    try {
      await axiosInstanceMultipart.post(CREATESKILL, formData);
      toast.success("Skill added successfully!");
      // Handle success (e.g., reset form, redirect)
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be 5MB or less");
        return;
      }
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue("image", undefined);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-gray-100 flex items-center justify-center p-4 pt-20">
      <Toaster position="top-right" theme="dark" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-xl shadow-2xl p-8 border border-gray-700">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400"
          >
            Showcase Your Skill
          </motion.h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <InputField
                name="title"
                label="Title"
                register={register}
                error={errors.title}
                isDirty={dirtyFields.title}
                icon={<FaStar className="text-cyan-400" />}
              />
              <InputField
                name="category"
                label="Category"
                register={register}
                error={errors.category}
                isDirty={dirtyFields.category}
                icon={<FaBriefcase className="text-cyan-400" />}
              />
              <SelectField
                name="proficiency"
                label="Proficiency"
                register={register}
                error={errors.proficiency}
                isDirty={dirtyFields.proficiency}
                options={["Beginner", "Intermediate", "Expert"]}
                icon={<FaStar className="text-cyan-400" />}
              />
              <InputField
                name="yearsOfExperience"
                label="Years of Experience"
                register={register}
                error={errors.yearsOfExperience}
                isDirty={dirtyFields.yearsOfExperience}
                type="number"
                icon={<FaClock className="text-cyan-400" />}
              />
              <SelectField
                name="availability"
                label="Availability"
                register={register}
                error={errors.availability}
                isDirty={dirtyFields.availability}
                options={["Full-time", "Part-time", "Freelance"]}
                icon={<FaClock className="text-cyan-400" />}
              />
              <InputField
                name="username"
                label="Username"
                register={register}
                error={errors.username}
                isDirty={dirtyFields.username}
                icon={<FaUser className="text-cyan-400" />}
              />
              <InputField
                name="email"
                label="Email"
                register={register}
                error={errors.email}
                isDirty={dirtyFields.email}
                type="email"
                icon={<FaEnvelope className="text-cyan-400" />}
              />
              <div className="space-y-2">
                <label htmlFor="image" className=" text-sm font-medium flex items-center">
                  <FaImage className="text-cyan-400 mr-2" />
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-gray-700 text-gray-100 px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-300"
                  >
                    Choose File
                  </label>
                  {previewImage && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <Image
                          src={previewImage}
                          alt="Preview"
                          width={50}
                          height={50}
                          className="rounded-md"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs transition-all duration-300 hover:bg-red-600"
                        >
                          X
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                {errors.image && (
                  <p className="text-red-400 text-xs">{errors.image.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className=" text-sm font-medium">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className={`w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-cyan-400 text-gray-100 transition-all duration-300 ${
                  errors.description ? "border-red-500" : dirtyFields.description ? "border-green-500" : ""
                }`}
              ></textarea>
              {errors.description && (
                <p className="text-red-400 text-xs">{errors.description.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-cyan-500 focus:ring-opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Add Skill"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

interface FieldProps {
  name: keyof SkillFormData;
  label: string;
  register: UseFormRegister<SkillFormData>;
  error: FieldError | undefined;
  isDirty: boolean | undefined;
  icon: React.ReactNode;
}

interface InputFieldProps extends FieldProps {
  type?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  register,
  error,
  isDirty,
  type = "text",
  icon,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
    <label htmlFor={name} className=" text-sm font-medium flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </label>
    <input
      {...register(name)}
      type={type}
      className={`w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-cyan-400 text-gray-100 transition-all duration-300 ${
        error ? "border-red-500" : isDirty ? "border-green-500" : ""
      }`}
    />
    {error && <p className="text-red-400 text-xs">{error.message}</p>}
  </motion.div>
);

interface SelectFieldProps extends FieldProps {
  options: string[];
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  register,
  error,
  isDirty,
  options,
  icon,
}) => (
  <motion.div whileHover={{ scale: 1.02 }} className="space-y-2">
    <label htmlFor={name} className=" text-sm font-medium flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </label>
    <select
      {...register(name)}
      className={`w-full px-3 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-cyan-400 text-gray-100 transition-all duration-300 ${
        error ? "border-red-500" : isDirty ? "border-green-500" : ""
      }`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && <p className="text-red-400 text-xs">{error.message}</p>}
  </motion.div>
);

export default AddSkillPage;