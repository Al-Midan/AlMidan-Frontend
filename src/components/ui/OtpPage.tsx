"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { MultiStepLoader as Loader } from "./multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import FormValues from "../../app/(auth)/register/interface";
import axiosInstance from "@/shared/helpers/axiosInstance";
import { OTP } from "@/shared/helpers/endpoints";
interface OtpPageProps {
  formData: FormValues;
}
const OtpPage: React.FC<OtpPageProps> = ({ formData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState([0, 0, 0, 0]);
  const [otpError, setOtpError] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const handleOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (otp.length > 4) {
      setOtpError("Please enter all  digit");
      return;
    } else {
      setOtpError("");
    }
    try {
      const response = await axiosInstance.post(OTP, otp);
      if (response.status === 200) {
        setLoading(true);
      }
      // Handle the response from the backend
      toast.success(response.data.message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
      setTimeout(() => {
        router.replace("/login");
      }, 15000);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response
        // &&
        // error.response.status === 401
      ) {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      } else {
        console.error("Error submitting form:", error);
        toast.error("An error occurred while registering the user", {
          style: { background: "black", color: "white" },
        });
      }
    }
  };
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = parseInt(value) || 0;
    setOtp(newOtp);

    if (value && index < 3) {
      const nextInput = inputRefs.current[index + 1];
      if (nextInput !== null) {
        nextInput.focus();
      }
    } else if (!value && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput !== null) {
        prevInput.focus();
      }
    }
  };
  const handleResendOtp = async () => {
    const loadingToastId = toast.loading("Processing", {
      style: { background: "black", color: "white" },
      position: "top-center",
    });
    try {
      const response = await axios.post(
        "http://localhost:5000/user-service/register",
        formData
      );
      toast.dismiss(loadingToastId);
      toast.success(response.data.message, {
        style: { background: "black", color: "white" },
        position: "top-center",
      });
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response
        // &&
        // error.response.status === 401
      ) {
        const errorMessage = error.response.data.message;
        toast.dismiss(loadingToastId);
        toast.error(errorMessage, {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      } else {
        console.error("Error submitting form:", error);
        toast.dismiss(loadingToastId);
        toast.error("An error occurred while resending the otp", {
          style: { background: "black", color: "white" },
          position: "top-center",
        });
      }
    }
  };
  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
  }, [timeLeft]);

  const calculateTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  const loadingStates = [
    {
      text: "Verifying Your Details...",
    },
    {
      text: "Checking Your OTP Code...",
    },
    {
      text: "Validating Information...",
    },
    {
      text: "Securing Your Data...",
    },
    {
      text: "Almost There!",
    },
    {
      text: "Registration Successful! Please login to continue.",
    },
    {
      text: "Welcome to Al-Midan",
    },
    {
      text: "Please Login",
    },
  ];

  return (
    <div className="relative flex flex-col justify-center overflow-hidden bg-black-100 py-12">
      <div className="relative  px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p></p>
            </div>
          </div>
          <Toaster />

          <div>
            <form onSubmit={handleOtp} method="post">
              <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  {otp.map((value, index) => (
                    <div key={index} className="w-16 h-16">
                      <input
                        className={`w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-black-100 focus:bg-black-300 focus:ring-1 ${
                          otpError && index === otp.length - 1
                            ? "ring-red-500 border-red-500"
                            : "ring-blue-700"
                        }`}
                        type="text"
                        value={value || ""}
                        onChange={(e) => handleInputChange(e, index)}
                        maxLength={1}
                        ref={(el) => {
                          if (el !== null) {
                            inputRefs.current[index] = el;
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-sm mt-2">{otpError}</p>
                )}

                <div className="flex flex-col space-y-5">
                  <Loader
                    loadingStates={loadingStates}
                    loading={loading}
                    duration={2000}
                    loop={false}
                  />

                  <div>
                    {/* <button className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm">
                      Verify Account
                    </button> */}
                    <button
                      className="bg-[#39C3EF] hover:bg-[#39C3EF]/90 text-black mx-auto text-sm md:text-base transition font-medium duration-200 h-10 rounded-lg px-8 flex items-center justify-center"
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

                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn&apos;t recieve code?</p>{" "}
                    <span>{calculateTime()}</span>
                    <a
                      className={`flex flex-row items-center ${
                        timeLeft > 0
                          ? "cursor-not-allowed text-gray-400"
                          : "text-blue-600 cursor-pointer"
                      }`}
                      onClick={timeLeft <= 0 ? handleResendOtp : undefined}
                      style={{
                        textDecoration:
                          timeLeft > 0 ? "line-through" : "underline",
                      }}
                    >
                      Resend
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
