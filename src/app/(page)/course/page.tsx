import Link from "next/link"

const page = () => {
    return (
      <div className="bg-black-100 min-h-screen flex justify-center items-center">
        <button className="px-4 py-2 rounded-md text-white bg-fuchsia-600	 hover:bg-indigo-700">
          
          <Link href={'/course/addCourse'}>Add Course</Link>   

        </button>
      </div>
    )
  }
  
  export default page 