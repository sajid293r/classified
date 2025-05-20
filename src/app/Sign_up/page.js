import React from 'react'
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

const page = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-md">
        <h2 className="text-3xl font-bold mt-1 text-center">Sign Up</h2>
        <p className="mb-6 text-gray-600 mt-2 text-center">Sign up to enjoy ChatGPT</p>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="please enter Email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="please enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex items-center justify-center p-2 rounded-md shadow-sm border border-gray-300 cursor-pointer hover:bg-gray-100">
          <p className="text-sm font-bold">Continue with Google</p>
          <button className="ml-2 text-blue-600">
            <FcGoogle style={{ fontSize: '24px' }} />
          </button>
        </div>

        <div className="flex items-center justify-center mt-4">
          <p>
            Already have an account?{' '}
            <span className="text-[#439eff]">
              <Link href="Sign_in">Sign in</Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
