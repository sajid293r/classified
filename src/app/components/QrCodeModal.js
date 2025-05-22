"use client";
import React from "react";

const QrCodeModal = ({ open, onClose, imageSrc }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <h2 className="text-lg font-bold mb-4">Scan this QR Code</h2>
        <img src={imageSrc} alt="QR Code" className="w-48 h-48 object-contain mb-4" />
        <button
          className="mt-2 px-4 py-2 bg-black text-white rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default QrCodeModal; 