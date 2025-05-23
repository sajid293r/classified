"use client";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from 'next/navigation';
import { FaArrowUp, FaQrcode, FaBars, FaTimes } from "react-icons/fa";
import { LayoutDashboard, Waves } from "lucide-react";
import sls from "../services/ServerLinkService";
import VoiceChatService from "../services/VoiceChatService";
import { setServerConnected } from '../store/connectionSlice';
import { addMessage, setPendingBotMessage, clearPendingBotMessage } from '../store/chatSlice';
import QrCodeModal from "./components/QrCodeModal";
import qrImg from "./image/QRcode.png";

function VoiceModal({ open, onClose, isRecording, setIsRecording, voiceChatRef, voiceSetupDone, setShowShaikUI, showGif }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <img
        src={showGif ? "/assistant-transformed.gif" : "/assistant-transformed.png"}
        alt="Assistant"
        style={{ width: '100%', maxWidth: 320, height: 'auto', marginBottom: 32, display: 'block' }}
      />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, width: '100%' }}>
        <button
          type="button"
          className="flex items-center justify-center transition"
          style={{ background: isRecording ? '#fee' : '#f5f5f5', border: 'none', borderRadius: '50%', width: 56, height: 56, marginBottom: 0 }}
          onClick={async () => {
            console.log('Mic button clicked');
            if (!voiceChatRef.current || !voiceChatRef.current.ws_is_ready()) {
              console.log('VoiceChatService not ready, initializing...');
              if (!voiceChatRef.current) {
                await new Promise(resolve => {
                  sls.on_connect = (channel) => {
                    voiceChatRef.current = new VoiceChatService(channel, true);
                    console.log('VoiceChatService instance created in modal', voiceChatRef.current);
                    resolve();
                  };
                  sls.connect();
                });
              }
              while (!voiceChatRef.current.ws_is_ready()) {
                await new Promise(r => setTimeout(r, 100));
              }
              console.log('VoiceChatService is now ready');
            }
            if (!isRecording) {
              if (!voiceSetupDone.current) {
                console.log('Setting up voiceChatRef in modal...');
                await voiceChatRef.current.setup();
                voiceSetupDone.current = true;
                console.log('voiceChatRef setup complete in modal');
              }
              console.log('Starting recording from modal...');
              voiceChatRef.current.start_recording();
              setIsRecording(true);
              setShowShaikUI(true);
              console.log('Recording started from modal');
            } else {
              console.log('Stopping recording from modal...');
              await voiceChatRef.current.stop_recording();
              setIsRecording(false);
              console.log('Recording stopped from modal');
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-7 h-7 ${isRecording ? "text-red-600" : "text-gray-400"}`}
            style={{ width: 28, height: 28, color: isRecording ? '#e11d48' : '#666' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0h3m-3 0H9m6-6a3 3 0 11-6 0V7a3 3 0 116 0v7z" />
          </svg>
        </button>
        <button
          onClick={onClose}
          style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 56, height: 56, fontSize: 28, color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}

const Page = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const dispatch = useDispatch();
  const chatHistory = useSelector((state) => state.chat.history);
  const pendingBotMessage = useSelector((state) => state.chat.pendingBotMessage);
  const voiceChatRef = useRef(null);
  const voiceSetupDone = useRef(false);
  const [selectedModel, setSelectedModel] = useState("ChatGPT 3.5");
  const [showShaikUI, setShowShaikUI] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const messageTimerRef = useRef(null);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);

  useEffect(() => {
    if (pendingBotMessage) {
      setShowGif(true);
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    } else {
      messageTimerRef.current = setTimeout(() => {
        setShowGif(false);
      }, 5000);
      return () => {
        if (messageTimerRef.current) {
          clearTimeout(messageTimerRef.current);
        }
      };
    }
  }, [pendingBotMessage]);

  useEffect(() => {
    if (voiceChatRef.current) return;
    console.log("Connecting to server...");
    sls.on_connect = (channel) => {
      console.log("Server connected, channel:", channel);
      voiceChatRef.current = new VoiceChatService(channel, true);
      console.log("VoiceChatService instance created", voiceChatRef.current);
      // Streaming bot message handlers
      voiceChatRef.current.on_message = (msgObj) => {
        let text = msgObj;
        if (typeof msgObj === 'object' && msgObj !== null) {
          text = msgObj.message || msgObj.content || (msgObj.choices && msgObj.choices[0]?.message?.content) || '';
        }
        if (msgObj.from === 'bot') {
          setIsSpeaking(true);
          if (!isVoiceInput) {
            if (typeof text === 'string' && text.trim() !== '') {
              dispatch(addMessage({ message: text, from: 'bot' }));
            }
          }
          dispatch(clearPendingBotMessage());
        }
      };
      voiceChatRef.current.on_panel_input = (fragment) => {
        let text = fragment;
        if (typeof fragment === 'object' && fragment !== null) {
          text = fragment.message || fragment.content || (fragment.choices && fragment.choices[0]?.message?.content) || '';
        }
        if (typeof text === 'string' && text.trim() !== '') {
          dispatch(setPendingBotMessage(text));
        }
      };
      voiceChatRef.current.on_qr_image_get = () => {
        setQrOpen(true);
      };
      dispatch(setServerConnected(true));
    };
    sls.on_fail = (err) => {
      console.log("Server connection failed:", err);
      dispatch(setServerConnected(false));
    };
    sls.connect();
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("WebSocket ready?", voiceChatRef.current?.ws_is_ready());
    if (query.trim() && voiceChatRef.current && voiceChatRef.current.ws_is_ready()) {
      console.log("Sending user message:", query);
      setIsVoiceInput(false); // text input
      dispatch(addMessage({ message: query, from: "user" }));
      voiceChatRef.current.send_text_message(query);
      setQuery("");
    }
  };

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
        console.warn("Audio permission denied or error:", err);
      });
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full flex items-center justify-between px-2 py-2 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100 sm:hidden">
        <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setShowMobileMenu(true)}>
          <FaBars size={22} />
        </button>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FaQrcode size={22} />
          </button>
        </div>
      </div>
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end">
          <div className="bg-white w-64 h-full shadow-lg flex flex-col p-4 gap-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setShowMobileMenu(false)} className="p-2"><FaTimes size={20} /></button>
            </div>
            <label className="font-medium mb-1">Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="rounded-full border px-3 py-2 text-base bg-white shadow mb-2"
            >
              <option>ChatGPT 3.5</option>
              <option>ChatGPT 4</option>
              <option>ChatGPT 4o</option>
            </select>
            <button
              className="bg-black text-white px-4 py-2 rounded-full w-full"
              onClick={() => { setIsLoggedIn(true); setShowMobileMenu(false); }}
            >
              Login
            </button>
            <button className="border border-black text-black px-4 py-2 rounded-full w-full">
              Signup
            </button>
            <button onClick={() => router.push("/pricing")} className="border border-black text-black px-4 py-2 rounded-full w-full">
              Upgrade
          </button>
          </div>
        </div>
      )}
      <div className="fixed top-0 left-0 w-full hidden sm:flex flex-row flex-wrap items-center justify-between gap-2 px-2 py-2 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FaQrcode size={22} />
          </button>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="rounded-full border px-3 py-1 text-base bg-white shadow"
          >
            <option>ChatGPT 3.5</option>
            <option>ChatGPT 4</option>
            <option>ChatGPT 4o</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-black text-white px-4 py-2 rounded-full"
            onClick={() => setIsLoggedIn(true)}
          >
            Login
          </button>
          <button className="border border-black text-black px-4 py-2 rounded-full">
            Signup
          </button>
          <button onClick={() => router.push("/pricing")} className="border border-black text-black px-4 py-2 rounded-full w-full">
              Upgrade
          </button>
        </div>
      </div>
      {showShaikUI && (
        <div className="flex flex-col items-center justify-between w-full h-full max-w-xs sm:max-w-xl mx-auto px-1 sm:px-4 pt-32 pb-16 sm:pt-36 sm:pb-8">
          <div className="flex-1 min-h-0 w-full overflow-y-auto bg-white rounded-lg shadow-inner my-2 px-1 sm:px-2 py-3 sm:py-4 max-h-[60vh] sm:max-h-none">
            {chatHistory.length === 0 && (
              <div className="flex items-center justify-center h-full w-full text-gray-400 text-lg sm:text-xl font-medium select-none" style={{ minHeight: 120 }}>
                What can I help with?
              </div>
            )}
            {chatHistory.map((item, idx) => (
              <div key={idx} className={`mb-2 text-left break-words text-sm sm:text-base text-black`}>
                <b>{item.from === "user" ? "You" : item.from === "bot" ? "Assistant" : "System"}:</b>{" "}
                {typeof item.message === 'string' ? item.message : ''}
              </div>
            ))}
            {pendingBotMessage && (
              <div className="text-left text-black animate-pulse mb-2 text-sm sm:text-base">
                <b>Assistant:</b> {pendingBotMessage}
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-none sm:max-w-lg flex flex-wrap items-center gap-2 border border-gray-300 bg-white shadow-lg px-2 sm:px-4 py-2 rounded-none sm:rounded-2xl fixed bottom-0 left-0 sm:sticky sm:bottom-2 z-40 h-auto min-h-[56px]"
          >
            <input
              type="text"
              className="flex-grow min-w-[100px] outline-none bg-transparent text-gray-800 text-base sm:text-lg placeholder:text-sm h-10 min-w-0"
              placeholder="Ask anything"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="flex-shrink-0 flex items-center justify-center text-black bg-white border border-black px-3 py-2 rounded-2xl transition h-10 mr-2 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px]"
              disabled={!query.trim()}
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <FaArrowUp size={16} />
            </button>
            <button
              type="button"
              className="flex-shrink-0 flex items-center justify-center text-white bg-black px-4 py-2 rounded-2xl transition h-10 min-w-[44px] min-h-[44px] sm:min-w-[40px] sm:min-h-[40px]"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
              onClick={() => setVoiceModalOpen(true)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="10" width="2" height="4" rx="1" fill="white"/>
                <rect x="7" y="7" width="2" height="10" rx="1" fill="white"/>
                <rect x="11" y="4" width="2" height="16" rx="1" fill="white"/>
                <rect x="15" y="7" width="2" height="10" rx="1" fill="white"/>
                <rect x="19" y="10" width="2" height="4" rx="1" fill="white"/>
              </svg>
            </button>
          </form>
        </div>
      )}
      <QrCodeModal open={qrOpen} onClose={() => setQrOpen(false)} imageSrc={qrImg.src || "/src/app/image/QRcode.png"} />
      <VoiceModal open={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} isRecording={isRecording} setIsRecording={setIsRecording} voiceChatRef={voiceChatRef} voiceSetupDone={voiceSetupDone} setShowShaikUI={setShowShaikUI} showGif={showGif} />
    </div>
  );
};

export default Page;
