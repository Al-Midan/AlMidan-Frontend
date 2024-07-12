"use client"
import Link from "next/link"
const Admin = () => {
   
    return (
      <div className="bg-black-100 min-h-screen flex justify-center items-center">
        <button className="px-4 py-2 rounded-md text-white bg-violet-700 hover:bg-violet-800">
          <Link href={'/admin/User-Management'}> User Management</Link>   
        </button>
      </div>
    )
  }
  
  export default Admin