"use client";

import React, { useState, useEffect } from 'react';
import { axiosInstanceMultipart } from "@/shared/helpers/axiosInstance";
import { UPDATEPROFILE } from "@/shared/helpers/endpoints";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserData {
  userId: string;
  username: string;
  profileImage: File | null;
}

interface Message {
  text: string;
  type: 'success' | 'error';
}

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    userId: '',
    username: '',
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ text: '', type: 'success' });

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    
    if (storedUserData) {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData({
        userId: parsedUserData._id || '',
        username: parsedUserData.username || '',
        profileImage: null,
      });
      setPreviewImage(parsedUserData.profileImage || null);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData({ ...userData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: 'success' });

    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('userID', userData.userId);
    if (userData.profileImage) {
      formData.append('profileImage', userData.profileImage);
    }

    try {
      const response = await axiosInstanceMultipart.post(UPDATEPROFILE, formData);
      
      if (response.status === 200) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        localStorage.setItem("userData", JSON.stringify(response.data.response));
        router.push("/profile");
      } else {
        setMessage({ text: 'Failed to update profile.', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={userData.username}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 rounded-md bg-gray-500 border-transparent focus:border-indigo-500 focus:bg-black focus:ring-0"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {previewImage && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Profile Preview"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
                  Choose File
                  <input
                    type="file"
                    name="profileImage"
                    id="profileImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {message.text && (
              <div className={`rounded-md p-4 ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;