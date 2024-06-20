"use client"
import Link from "next/link"
import { useSelector } from 'react-redux';

const Page = () => {
  const User = useSelector((state: any) => state.user);
  console.log('Current user state:', User);

  return (
    <>
      <div className="bg-black-100 min-h-screen flex justify-center items-center">
        <button className="px-4 py-2 rounded-md text-white bg-fuchsia-600 hover:bg-indigo-700">
          <Link href={'/course'}> Course Section</Link>   
        </button>
      </div>
    </>
  )
}

export default Page;