"use client";
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
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button
              className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              onClick={() => handleButtonClick("/admin/User-Management")}
            >
              Manage Users
            </button>
            <button
              className="bg-gradient-to-br from-green-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              onClick={() => handleButtonClick("/admin/Course-Management")}
            >
              Manage Courses
            </button>
            <button
              className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              onClick={() => handleButtonClick("/admin/Complaint-Management")}
            >
              Manage Complaints
            </button>
            <button
              className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold py-2 px-4 rounded-lg shadow-md"
              onClick={() => handleButtonClick("/admin/Job-Management")}
            >
              Manage Jobs
            </button>
            <button
              className="bg-gradient-to-br from-pink-500 to-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-md"
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
