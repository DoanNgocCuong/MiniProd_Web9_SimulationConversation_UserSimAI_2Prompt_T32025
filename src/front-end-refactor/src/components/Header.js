import React from 'react';

const Header = ({ isDarkMode, setIsDarkMode, connectionStatus }) => {
    return (
        <div className="sticky top-0 z-50 p-4 rounded-2xl mb-6 flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                AI Conversation Simulator
            </h1>
            <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${connectionStatus === "connected" ? "bg-green-100 text-green-800" :
                        connectionStatus === "disconnected" ? "bg-red-100 text-red-800" :
                            connectionStatus === "checking" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                    }`}>
                    {connectionStatus === "connected" ? "Connected" :
                        connectionStatus === "disconnected" ? "Disconnected" :
                            connectionStatus === "checking" ? "Checking..." : "Error"}
                </span>
                <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="px-6 py-2.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-medium transform transition-all duration-200 hover-scale active-scale shadow-lg"
                >
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>
            </div>
        </div>
    );
};

export default Header;