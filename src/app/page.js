"use client";
import { useState, useEffect, useRef } from "react";
import { FaMicrophone, FaArrowUp, FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";
import Shaikimage from "../app/image/Shaik.png";

const Page = ({ onSubmit = (query) => console.log("Submitted:", query) }) => {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [showText, setShowText] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false); // Simulate login state
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
    <div className="flex min-h-screen bg-white relative">
      {/* Sidebar (only for logged-in users) */}
      {loggedIn && (
        <div
          className={`fixed top-0 left-0 z-30 h-screen bg-gray-100 transition-all duration-300 border-r border-gray-300 ${
            isOpen ? "w-[200px] p-4" : "w-0 overflow-hidden"
          }`}
        >
          <div className="flex justify-between items-center text-black mb-4">
            <h2 className="text-lg font-bold mt-8">History</h2>
          </div>
          <ul className="flex flex-col gap-2 overflow-y-auto max-h-[80vh]">
            {history.map((item, index) => (
              <li
                key={index}
                className="bg-white p-2 rounded-xl shadow text-sm hover:bg-blue-50 cursor-pointer whitespace-nowrap"
                onClick={() => setQuery(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <LayoutDashboard
        onClick={toggleSidebar}
        className="cursor-pointer text-xl z-40 fixed top-4 left-4"
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 px-4 sm:px-6 py-2 min-h-screen w-full ${
          loggedIn && isOpen ? "lg:ml-[200px]" : "lg:ml-0"
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center ml-12 mb-4 gap-2">
          <div className="flex items-center w-32 sm:w-auto border border-gray-300 rounded-2xl">
            <select className="text-black p-2 rounded-2xl text-sm outline-none border-none">
              <option>ChatGPT 3.5</option>
              <option>ChatGPT 4</option>
              <option>ChatGPT Turbo</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            {!loggedIn ? (
              <>
                <button
                  onClick={() => setLoggedIn(true)}
                  className="bg-black text-white p-2 px-4 rounded-2xl"
                >
                  Login
                </button>
                <button
                  onClick={() => setLoggedIn(true)}
                  className="border border-gray-300 text-gray-800 p-2 px-4 rounded-2xl"
                >
                  Signup
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setOpen((open) => !open)}>
                  <FaUserCircle size={28} className="text-gray-800" />
                </button>
                {/* tooltip */}
                {open && (
                  <div
                    ref={tooltipRef}
                    className="absolute  mt-16 -translate-x-1/2 w-20 border border-gray-300 text-black text-sm rounded shadow-lg p-2 z-10"
                  >
                    <button
                      onClick={() => {
                        setLoggedIn(false);
                        setOpen(false); 
                      }}
                      className="text-black flex gap-2"
                    >
                      <FiLogOut className="mt-1" /> Logout
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="flex justify-center items-center h-52">
          {showText && (
            <Image
              src={Shaikimage}
              alt="Voice Input"
              width={300}
              height={300}
              className="rounded-full h-56 w-56 object-fill bg-gray-200"
            />
          )}
        </div>

        <h1 className="flex justify-center items-center py-2 text-center text-xl text-black [word-spacing:3px]">
          What can I help with?
        </h1>

        {/* Input Form */}
        <div className="w-full flex justify-center overflow-x-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 bg-white shadow-lg"
          >
            <input
              type="text"
              className="flex-grow outline-none bg-transparent text-gray-800 text-base placeholder:text-sm"
              placeholder="Ask anything"
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
               
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaMicrophone size={20} />
              </button>
            )}
            <div className="bg-black text-white rounded-3xl">
              <button
                inputstate="default"
                state="disabled"
                aria-label="Start voice mode"
                className="relative flex h-9 items-center justify-center rounded-full bg-black text-white transition-colors disabled:text-gray-50 disabled:opacity-30 can-hover:hover:opacity-70 dark:bg-white dark:text-black min-w-8 p-2 cursor-pointer"
                onClick={() => {
                  setShowText(!showText);
                  console.log("Voice input clicked, showText:", !showText);
                }}>
                <div className="flex items-center justify-center" >
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
