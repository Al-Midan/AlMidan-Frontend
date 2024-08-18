const Admin = () => {
  return (
    <div className="bg-black-100 min-h-screen flex flex-col">
      <header className="p-4 bg-black-100 shadow-lg mt-28">
        <h1 className="text-3xl text-white font-bold text-center">Admin Dashboard</h1>
      </header>
      <main className="flex-grow flex justify-center items-center">
        <div className="text-center text-white max-w-xl">
          <h2 className="text-2xl mb-4">Welcome to the Admin Panel</h2>
          <p className="mb-6">Manage your application efficiently with the options available in the navigation.</p>
          <p>Explore the various sections to manage users, courses, complaints, jobs, and skills.</p>
        </div>
      </main>
      <footer className="p-4 bg-black-100 text-center text-gray-400">
        <p>&copy; 2024 Al-Midan. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Admin;
