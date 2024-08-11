"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import FormValues from "../interface";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import OtpPage from "@/components/ui/OtpPage";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { REGISTER } from "@/shared/helpers/endpoints";
const Register = () => {
  const [response, setResponse] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [formData, setFormData] = useState<FormValues | null>(null);
  const backgroundImage =
    "https://almidancoursethumbnail.s3.ap-south-1.amazonaws.com/loginpage.webp";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements;
    const formValues: FormValues = {
      username: (formElements.namedItem("username") as HTMLInputElement).value,
      email: (formElements.namedItem("email") as HTMLInputElement).value,
      password: (formElements.namedItem("password") as HTMLInputElement).value,
      confirmPassword: (
        formElements.namedItem("confirmPassword") as HTMLInputElement
      ).value,
    };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formValues.email)) {
      setEmailError("Please enter a valid email address");
      return;
    } else {
      setEmailError("");
    }

    // Password validation
    const passwordRegex =
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formValues.password)) {
      setPasswordError(
        "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
      );
      return;
    } else {
      setPasswordError("");
    }

    // Confirm password validation
    if (formValues.password !== formValues.confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    } else {
      setConfirmPasswordError("");
    }

    // If no errors, proceed with form submission
    setFormData(formValues);
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });

    try {
      const response = await axiosInstance.post(REGISTER, formValues);

      toast.dismiss(loadingToastId);
      toast.success(response.data.message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      setTimeout(() => {
        if (response.status == 200) {
          setResponse(true);
        }
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.message;
        toast.dismiss(loadingToastId);
        toast.error(errorMessage, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      } else {
        console.error("Error submitting form:", error);
        toast.dismiss(loadingToastId);
        toast.error("An error occurred while login the user", {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      }
    }
  };

  return (
    <main className="w-full flex flex-col lg:flex-row bg-black-100 mx-auto px-4 sm:px-6 lg:px-8 overflow-clip">
      <div className="flex-1 flex items-center justify-center min-h-screen py-12 lg:py-0">
        <div className="w-full max-w-md space-y-8 text-white">
          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold sm:text-3xl">
              Welcome👋 Sign Up Today!🚀
            </h3>
            <p className="">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Login
              </Link>
            </p>
          </div>
          <div className="relative">
            <span className="block w-full h-px bg-black-300"></span>
            <p className="inline-block w-fit text-sm bg-black-100 px-2 absolute -top-2 left-1/2 transform -translate-x-1/2">
              Or continue with
            </p>
          </div>
          <AnimatePresence>
            {response && formData ? (
              <motion.div
                key="otp-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OtpPage formData={formData} />
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form
                  onSubmit={handleSubmit}
                  method="post"
                  className="space-y-5"
                >
                  <div>
                    <label className="font-medium">Username</label>
                    <input
                      type="text"
                      className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                      name="username"
                    />
                  </div>
                  <div>
                    <label className="font-medium">Email</label>
                    <input
                      type="email"
                      className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${
                        emailError
                          ? "border-red-500"
                          : "focus:border-indigo-600"
                      } shadow-sm rounded-lg`}
                      name="email"
                    />
                    {emailError && (
                      <p className="text-red-500 mt-1">{emailError}</p>
                    )}
                    <Toaster />
                  </div>
                  <div className="gap-x-2">
                    <div>
                      <label className="font-medium">Password</label>
                      <input
                        type="password"
                        className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${
                          passwordError
                            ? "border-red-500"
                            : "focus:border-indigo-600"
                        } shadow-sm rounded-lg`}
                        name="password"
                      />
                      {passwordError && (
                        <p className="text-red-500 mt-1">{passwordError}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="font-medium">Confirm Password</label>
                    <input
                      type="password"
                      className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${
                        confirmPasswordError
                          ? "border-red-500"
                          : "focus:border-indigo-600"
                      } shadow-sm rounded-lg`}
                      name="confirmPassword"
                    />
                    {confirmPasswordError && (
                      <p className="text-red-500 mt-1">
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                  <HoverBorderGradient
                    containerClassName="w-full mt-2 px-3 py-2"
                    duration={1}
                    clockwise={true}
                  >
                    Signup
                  </HoverBorderGradient>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center min-h-screen lg:h-screen py-12 lg:py-0">
        <div
          className="relative z-10 w-full max-w-[600px] h-[500px] lg:h-[700px] bg-cover border border-white/5 rounded-3xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        >
          <div className="px-6 py-10 lg:px-8 lg:py-14 h-full flex flex-col justify-between">
            <h1 className="text-white text-3xl font-bold">Al-Midan</h1>
            <div className="space-y-4">
              <h3 className="text-white text-2xl font-bold">
                Unleash Your Freelance Potential
              </h3>
              <p className="text-gray-300">
                Join our vibrant community of freelancers and unlock a world of
                opportunities. Elevate your career to new heights, work on
                exciting projects, and make your mark.
              </p>

              <div className="flex items-center -space-x-2 overflow-hidden">
                <img
                  src="https://randomuser.me/api/portraits/women/79.jpg"
                  className="w-9 h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
                  className="w-9 h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f"
                  className="w-9 h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://randomuser.me/api/portraits/men/86.jpg"
                  className="w-9 h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                  className="w-9 h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <p className="text-sm text-gray-400 font-medium translate-x-5">
                  Join 5,000+ users
                </p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <a
                  href="#"
                  className="text-white hover:text-gray-300 transition-colors duration-300"
                >
                  Learn More
                </a>
                <button className="bg-black-100 text-white px-4 py-2 rounded-md hover:bg-gray-200 hover:text-black-200 transition-colors duration-300">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 my-auto h-[500px] border border-white/5 rounded-3xl"></div>
      </div>
    </main>
  );
};
export default Register;
