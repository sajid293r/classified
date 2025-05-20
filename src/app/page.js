"use client";
import { useState } from "react";
import { FaMicrophone, FaArrowUp, FaBars } from "react-icons/fa";
import Image from "next/image";
import Link from 'next/link';


const Page = ({ onSubmit = (query) => console.log("Submitted:", query) }) => {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [showText, setShowText] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setHistory((prev) => (prev.includes(query) ? prev : [query, ...prev]));
      setQuery("");
    }
  };

  return (
    <div className="min-h-[50px] flex flex-col lg:flex-row bg-white">
      {/* Sidebar */}
      <div className=" bg-gray-100 border-r border-gray-300">
        <div className="flex justify-between mt-4 items-center text-black p-2 duration-100">
          <FaBars
            onClick={toggleSidebar}
            className="cursor-pointer text-xl ml-auto duration-1000"
          />
          
        </div>

        {isOpen && (
          <div className="w-full lg:w-[200px] md:[200px]   p-4 border-b lg:border-b-0  border-gray-300">
            <h2 className="text-lg font-bold mb-4">History</h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="bg-white p-2 rounded-xl shadow text-sm hover:bg-blue-50 cursor-pointer"
                  onClick={() => setQuery(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 py-2 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h1 className="text-2xl text-black font-bold">ChatGPT</h1>
            <select className="text-black p-2 rounded-2xl px-1 border border-gray-300 text-sm">
              <option>GPT-3.5</option>
              <option>GPT-4</option>
              <option>GPT-4 Turbo</option>
            </select>
          </div>
          <div className="flex gap-2">
           <Link href="Sign_in"> <button className="bg-black text-white p-2 px-4 rounded-2xl">
              Login
            </button>
            </Link>
            <Link href="Sign_up"> <button className="border border-gray-300 text-gray-800 p-2 px-4 rounded-2xl">
              Signup
            </button></Link>
          </div>
        </div>

        {/* Reserved space for image */}
        <div className="flex justify-center items-center h-52">
          {showText && (
            <Image
              src="https://plus.unsplash.com/premium_photo-1676070096487-32dd955e09e0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3V0ZSUyMGZsb3dlcnxlbnwwfHwwfHx8MA%3D%3D"
              alt="Voice Input"
              width={300}
              height={300}
              className="rounded-4xl h-40 w-40 "
            />
          )}
        </div>

        <h1 className="py-2 text-center text-sm font-bold">
          What can I help with?
        </h1>

        <div className="h-4" />

        {/* Input form */}
        <div className="w-full flex justify-center overflow-x-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 bg-white shadow-lg"
          >
            <input
              type="text"
              className="flex-grow outline-none bg-transparent text-gray-800 text-base placeholder:text-sm"
              placeholder="Ask me anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim() ? (
              <button
                type="submit"
                className="text-white bg-black hover:bg-black px-2 py-2 rounded-2xl transition"
              >
                <FaArrowUp size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowText(!showText);
                  console.log("Voice input clicked, showText:", !showText);
                }}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaMicrophone size={20} />
              </button>
            )}
            <div className="bg-black text-white rounded-3xl">
              <button
                inputstate="default"
                state="disabled"
                composercontroller="[object Object]"
                disablereason="empty_text_content"
                data-testid="composer-speech-button"
                aria-label="Start voice mode"
                className="relative flex h-9 items-center justify-center rounded-full bg-black text-white transition-colors disabled:text-gray-50 disabled:opacity-30 can-hover:hover:opacity-70 dark:bg-white dark:text-black min-w-8 p-2"
              >
                <div className="flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-md"
                  >
                    <path
                      d="M5.66699 14.4165V3.5835C5.66699 2.89314 6.22664 2.3335 6.91699 2.3335C7.6072 2.33367 8.16699 2.89325 8.16699 3.5835V14.4165C8.16699 15.1068 7.6072 15.6663 6.91699 15.6665C6.22664 15.6665 5.66699 15.1069 5.66699 14.4165ZM9.83301 11.9165V6.0835C9.83301 5.39325 10.3928 4.83367 11.083 4.8335C11.7734 4.8335 12.333 5.39314 12.333 6.0835V11.9165C12.333 12.6069 11.7734 13.1665 11.083 13.1665C10.3928 13.1663 9.83301 12.6068 9.83301 11.9165ZM1.5 10.2505V7.75049C1.5 7.06013 2.05964 6.50049 2.75 6.50049C3.44036 6.50049 4 7.06013 4 7.75049V10.2505C3.99982 10.9407 3.44025 11.5005 2.75 11.5005C2.05975 11.5005 1.50018 10.9407 1.5 10.2505ZM14 10.2505V7.75049C14 7.06013 14.5596 6.50049 15.25 6.50049C15.9404 6.50049 16.5 7.06013 16.5 7.75049V10.2505C16.4998 10.9407 15.9402 11.5005 15.25 11.5005C14.5598 11.5005 14.0002 10.9407 14 10.2505Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
                <span className="[display:var(--force-hide-label)] ps-1 pe-1 text-[13px] font-semibold whitespace-nowrap">
                  Voice
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
