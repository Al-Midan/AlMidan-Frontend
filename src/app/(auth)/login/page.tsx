"use client";
import Link from "next/link";
import GithubButton from "@/components/ui/GithubButton";
import GoogleButton from "@/components/ui/GoogleButton";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import FormValues from "./interface";
import { useRouter } from "next/navigation";
const Login = () => {
  const router = useRouter();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
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
    console.log("formValues", formValues);
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });

    try {
      console.log("Request Headers:", axios.defaults.headers);

      const response = await axios.post(
        "http://localhost:5000/user-service/login",
        formValues,
        { withCredentials: true }
      );

      console.log("Response from backend:", response);

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
      console.log("User data stored", userData);
      localStorage.setItem("userData", JSON.stringify(userData));
      // After successful login
      localStorage.setItem("accessToken", userData.accessToken);
      localStorage.setItem("refreshToken", userData.refreshToken);

      const Message = response.data.message;
      toast.dismiss(loadingToastId);

      // Update the loading toast to success
      toast.success(Message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      if (userData.roles[0] == "admin") {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response
        // &&
        // error.response.status === 401
      ) {
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
    <main className="w-full flex bg-black-100 mx-auto sm:px-10 px-5 overflow-clip">
      <div className="flex-1 flex items-center  justify-center h-screen">
        <div className="w-full max-w-md space-y-8 text-white px-4 e sm:px-0">
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

          <div className="grid grid-cols-2 gap-x-2">
            <GoogleButton />
            <GithubButton />
          </div>
          <div className="relative">
            <span className="block w-full h-px bg-black-300"></span>

            <p className="inline-block w-fit text-sm  px-2 mt-2 absolute  inset-x-0 mx-auto">
              Or continue with
            </p>
          </div>
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
                <p className="text-red-500 mt-1">{confirmPasswordError}</p>
              )}
            </div>
            {/* <button className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150">
              Login
            </button> */}
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
      <div className="relative flex-1 flex items-center justify-center h-screen lg:flex">
        <div
          className="relative z-10 max-w-[600px] max-h-[700px] bg-cover border border-white/5 rounded-3xl"
          style={{
            backgroundImage: "url(./loginpage.webp)",
            height: "calc(100vh - 80px)",
          }}
        >
          <div className="px-8 py-14">
            <h1 className="text-white text-3xl font-bold">Al-Midan</h1>
            <div className="mt-14 space-y-4">
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

export default Login;
