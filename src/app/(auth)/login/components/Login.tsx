"use client";
import Link from "next/link";
import GithubButton from "@/components/ui/GithubButton";
import GoogleButton from "@/components/ui/GoogleButton";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import FormValues from "../interface";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/userSlice";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { LOGIN } from "@/shared/helpers/endpoints";
const Login = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const backgroundImage =
    "https://almidancoursethumbnail.s3.ap-south-1.amazonaws.com/loginpage.webp";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements;
    const formValues: FormValues = {
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
      setPasswordError("Password Incorrect");
      return;
    } else {
      setPasswordError("");
    }

    // If no errors, proceed with form submission
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });

    try {
      const response = await axiosInstance.post(LOGIN, formValues);

      // Extracting the user data from the response
      const userData = response.data.user || response.data;
      if (userData.isBlocked) {
        toast.dismiss(loadingToastId);
        toast.warning("OH! YOU'RE BLOCKED BUDDY. YOU CAN'T ENTER.", {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
        return;
      }
      // Storing the user data in localStorage
      dispatch(setUser(userData));
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);

      const Message = response.data.message;
      toast.dismiss(loadingToastId);

      // Update the loading toast to success
      toast.success(Message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      if (userData.roles == "admin") {
        router.replace("/admin");
      } else {
        router.replace("/home");
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
        console.error("Error submitting form:", error);
        toast.error("An error occurred while registering the user", {
          style: { background: "black", color: "white" },
        });
      }
    }
  };
  return (
    <main className="w-full flex flex-col lg:flex-row bg-black-100 mx-auto px-4 sm:px-6 lg:px-8 overflow-clip">
      <div className="flex-1 flex items-center justify-center min-h-screen py-12 lg:py-0">
        <div className="w-full max-w-md space-y-8 text-white px-4 sm:px-0">
          <div className="mt-5 space-y-2 text-center">
            <h3 className="text-2xl font-bold sm:text-3xl">Welcome Back</h3>
            <p className="">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* <div className="grid grid-cols-2 gap-x-2">
            <GoogleButton />
            <GithubButton />
          </div> */}
          {/* <div className="relative">
            <span className="block w-full h-px bg-black-300"></span>
            <p className="inline-block w-fit text-sm px-2 mt-2 absolute inset-x-0 mx-auto">
              Or continue with
            </p>
          </div> */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium">Email</label>
              <input
                type="email"
                className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${
                  emailError ? "border-red-500" : "focus:border-indigo-600"
                } shadow-sm rounded-lg`}
                name="email"
              />
              {emailError && <p className="text-red-500 mt-1">{emailError}</p>}
            </div>
            <Toaster />
            <div>
              <label className="font-medium">Password</label>
              <input
                type="password"
                className={`w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border ${
                  passwordError ? "border-red-500" : "focus:border-indigo-600"
                } shadow-sm rounded-lg`}
                name="password"
              />
              {passwordError && (
                <p className="text-red-500 mt-1">{passwordError}</p>
              )}
            </div>
            <HoverBorderGradient
              containerClassName="w-full mt-2 px-3 py-2"
              duration={1}
              clockwise={true}
            >
              Login
            </HoverBorderGradient>
          </form>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center min-h-screen lg:flex">
        <div
          className="relative z-10 w-full max-w-[600px] bg-cover border border-white/5 rounded-3xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            height: "calc(100vh - 80px)",
            maxHeight: "700px",
          }}
        >
          <div className="px-6 py-10 sm:px-8 sm:py-14">
            <h1 className="text-white text-2xl sm:text-3xl font-bold">
              Al-Midan
            </h1>
            <div className="mt-10 sm:mt-14 space-y-4">
              <h3 className="text-white text-xl sm:text-2xl font-bold">
                Unleash Your Freelance Potential
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Join our vibrant community of freelancers and unlock a world of
                opportunities. Elevate your career to new heights, work on
                exciting projects, and make your mark.
              </p>
              <div className="flex items-center -space-x-2 overflow-hidden">
                <img
                  src="https://randomuser.me/api/portraits/women/79.jpg"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=a72ca28288878f8404a795f39642a46f"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://randomuser.me/api/portraits/men/86.jpg"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <img
                  src="https://images.unsplash.com/photo-1510227272981-87123e259b17?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=3759e09a5b9fbe53088b23c615b6312e"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white"
                  alt="User Avatar"
                />
                <p className="text-xs sm:text-sm text-gray-400 font-medium translate-x-5">
                  Join 5,000+ users
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 space-y-2 sm:space-y-0">
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

export default Login;
