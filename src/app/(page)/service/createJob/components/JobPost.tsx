"use client"
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { axiosInstanceMultipart } from '@/shared/helpers/axiosInstance';
import { CREATEJOB } from '@/shared/helpers/endpoints';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  description: string;
  category: string;
  skillsRequired: string[];
  budget: string;
  paymentType: 'Hourly' | 'Fixed Price';
  duration: string;
  experienceLevel: string;
  postedDate: string;
  deadline: string;
  status: 'Open' | 'Closed';
  image: File | null;
}

const JobPostingForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    skillsRequired: [],
    budget: '',
    paymentType: 'Hourly',
    duration: '',
    experienceLevel: '',
    postedDate: new Date().toISOString(),
    deadline: '',
    status: 'Open',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skills = e.target.value.split(',').map((skill) => skill.trim());
    setFormData((prevData) => ({
      ...prevData,
      skillsRequired: skills,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, skillsRequired: undefined }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step: number): boolean => {
    const stepErrors: Partial<FormData> = {};
    switch (step) {
      case 1:
        if (!formData.title) stepErrors.title = 'Title is required';
        if (!formData.description) stepErrors.description = 'Description is required';
        if (!formData.category) stepErrors.category = 'Category is required';
        break;
      case 2:
        if (formData.skillsRequired.length === 0) stepErrors.skillsRequired = ['At least one skill is required'];
        if (!formData.budget) stepErrors.budget = 'Budget is required';
        break;
      case 3:
        if (!formData.duration) stepErrors.duration = 'Duration is required';
        if (!formData.experienceLevel) stepErrors.experienceLevel = 'Experience level is required';
        if (!formData.deadline) stepErrors.deadline = 'Deadline is required';
        break;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };
  
  const prevStep = () => {
    setErrors({});  
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) {
      return;
    }
  
    try {
      const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
        if (key === 'skillsRequired') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'image' && value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, String(value));
        }
      });
  
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        Object.entries(parsedUserData).forEach(([key, value]) => {
          formDataToSend.append(key, String(value));
        });
      }
  
      const response = await axiosInstanceMultipart.post(CREATEJOB, formDataToSend);
  
      console.log('Job posted successfully:', response.data);
      setSuccessMessage('Job posted successfully!');
      
      setTimeout(() => {
        router.push('/service');
      }, 2000);
    } catch (error) {
      console.error('Error posting job:', error);
      setSuccessMessage('Error posting job. Please try again.');
    }
  };
  

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <InputField
              id="title"
              name="title"
              label="Job Title"
              value={formData.title}
              onChange={handleInputChange}
              error={errors.title}
            />
            <SelectField
              id="category"
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleInputChange}
              error={errors.category}
              options={[
                { value: "Web Development", label: "Web Development" },
                { value: "Graphic Design", label: "Graphic Design" },
                { value: "Writing", label: "Writing" },
                { value: "Data Science", label: "Data Science" },
                { value: "Marketing", label: "Marketing" },
                { value: "Other", label: "Other" },
              ]}
            />
            <TextAreaField
              id="description"
              name="description"
              label="Job Description"
              value={formData.description}
              onChange={handleInputChange}
              error={errors.description}
            />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <InputField
              id="skillsRequired"
              name="skillsRequired"
              label="Skills Required (comma-separated)"
              value={formData.skillsRequired.join(', ')}
              onChange={handleSkillsChange}
              error={errors.skillsRequired?.[0]}
            />
            <InputField
              id="budget"
              name="budget"
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={handleInputChange}
              error={errors.budget}
            />
            <div className="flex space-x-4">
              <RadioButton
                id="hourly"
                name="paymentType"
                label="Hourly"
                value="Hourly"
                checked={formData.paymentType === 'Hourly'}
                onChange={handleInputChange}
              />
              <RadioButton
                id="fixedPrice"
                name="paymentType"
                label="Fixed Price"
                value="Fixed Price"
                checked={formData.paymentType === 'Fixed Price'}
                onChange={handleInputChange}
              />
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <SelectField
              id="duration"
              name="duration"
              label="Duration"
              value={formData.duration}
              onChange={handleInputChange}
              error={errors.duration}
              options={[
                { value: "Less than 1 week", label: "Less than 1 week" },
                { value: "1-4 weeks", label: "1-4 weeks" },
                { value: "1-3 months", label: "1-3 months" },
                { value: "3-6 months", label: "3-6 months" },
                { value: "More than 6 months", label: "More than 6 months" },
              ]}
            />
            <SelectField
              id="experienceLevel"
              name="experienceLevel"
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={handleInputChange}
              error={errors.experienceLevel}
              options={[
                { value: "Entry Level", label: "Entry Level" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Expert", label: "Expert" },
              ]}
            />
            <InputField
              id="deadline"
              name="deadline"
              label="Deadline"
              type="date"
              value={formData.deadline}
              onChange={handleInputChange}
              error={errors.deadline}
            />
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="cursor-pointer inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-300"
              >
                Upload Image
              </label>
            </div>
            {imagePreview && (
              <div className="mt-4">
                <img src={imagePreview} alt="Preview" className="rounded-lg max-h-48 object-cover" />
              </div>
            )}
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Create a Futuristic Job Posting
          </h2>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-4 bg-green-500 text-white rounded-md text-center"
            >
              {successMessage}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button onClick={prevStep} className="bg-gradient-to-r from-purple-500 to-indigo-500">
                  Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button onClick={nextStep} className="bg-gradient-to-r from-pink-500 to-red-500">
                  Next
                </Button>
              ) : (
                <Button type="submit" className="bg-gradient-to-r from-green-400 to-blue-500">
                  Post Job
                </Button>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const InputField: React.FC<{
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
}> = ({ id, name, label, value, onChange, error, type = "text" }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="relative">
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="peer w-full p-4 pt-8 bg-transparent border-2 border-purple-500 rounded-lg outline-none transition-all duration-300 focus:border-pink-500 text-white"
      placeholder=" "
    />
    <label
      htmlFor={id}
      className="absolute top-2 left-4 text-sm text-purple-300 transition-all duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm"
    >
      {label}
    </label>
    {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
  </motion.div>
);

const TextAreaField: React.FC<{
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}> = ({ id, name, label, value, onChange, error }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="relative">
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      rows={4}
      className="peer w-full p-4 pt-8 bg-transparent border-2 border-purple-500 rounded-lg outline-none transition-all duration-300 focus:border-pink-500 text-white"
      placeholder=" "
    />
    <label
      htmlFor={id}
      className="absolute top-2 left-4 text-sm text-purple-300 transition-all duration-300 peer-placeholder-shown:top-6 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm"
    >
      {label}
    </label>
    {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
  </motion.div>
);

const SelectField: React.FC<{
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    error?: string;
    options: { value: string; label: string }[];
  }> = ({ id, name, label, value, onChange, error, options }) => (
    <motion.div whileHover={{ scale: 1.02 }} className="relative">
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full p-4 pt-8 bg-transparent border-2 border-purple-500 rounded-lg outline-none transition-all duration-300 focus:border-pink-500 text-white appearance-none"
      >
        <option value="" disabled>Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-800">
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className="absolute top-2 left-4 text-sm text-purple-300 transition-all duration-300"
      >
        {label}
      </label>
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </motion.div>
  );
  
  const RadioButton: React.FC<{
    id: string;
    name: string;
    label: string;
    value: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ id, name, label, value, checked, onChange }) => (
    <div className="flex items-center">
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className={`cursor-pointer px-4 py-2 rounded-full transition-colors duration-300 ${
          checked
            ? 'bg-purple-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {label}
      </label>
    </div>
  );
  
  const Button: React.FC<{
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
    children: React.ReactNode;
  }> = ({ onClick, type = 'button', className, children }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      className={`px-6 py-3 text-white font-medium rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${className}`}
    >
      {children}
    </motion.button>
  );
  
  export default JobPostingForm;