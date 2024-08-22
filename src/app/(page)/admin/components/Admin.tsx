import React from "react";
import { useRouter } from "next/navigation";

const Admin = () => {
  const router = useRouter();

  const handleButtonClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="bg-black-100 min-h-screen flex flex-col">
      <main className="flex-grow flex justify-center items-center">
        <div className="text-center text-white max-w-xl">
          <h2 className="text-2xl mb-4">Welcome to the Admin Panel</h2>
          <p className="mb-6">
            Manage your application efficiently with the options available in
            the navigation.
          </p>
          <p>
            Explore the various sections to manage users, courses, complaints,
            jobs, and skills.
          </p>
          <div className="flex flex-col space-y-4 mt-8">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleButtonClick("/admin/User-Management")}
            >
              Manage Users
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleButtonClick("/admin/Course-Management")}
            >
              Manage Courses
            </button>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleButtonClick("/admin/Complaint-Management")}
            >
              Manage Complaints
            </button>
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleButtonClick("/admin/Job-Management")}
            >
              Manage Jobs
            </button>
            <button
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => handleButtonClick("/admin/Skill-Management")}
            >
              Manage Skills
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
