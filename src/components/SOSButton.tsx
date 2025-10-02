import React from "react";

export default function SOSButton() {
  const triggerSOS = () => {
    alert("🚨 Emergency SOS Triggered!"); 
    // here you can call API, send SMS, or trigger any backend service
  };

  return (
    <button
      onClick={triggerSOS}
      className="bg-red-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition"
    >
      🚨 Emergency SOS
    </button>
  );
}
