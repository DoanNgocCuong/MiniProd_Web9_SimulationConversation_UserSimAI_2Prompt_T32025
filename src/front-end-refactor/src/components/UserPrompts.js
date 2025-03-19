import React from 'react';

const UserPrompts = ({
    userPrompts,
    toggleAllPrompts,
    addNewPrompt,
    togglePromptSelection,
    areAllPromptsSelected,
    isSimulating,
    isDarkMode,
    showAllPrompts,
    setShowAllPrompts
}) => {
    return (
        <div className={`relative z-[1000] backdrop-blur-xl bg-opacity-80 p-6 rounded-2xl shadow-xl mb-6 transform transition-all duration-300 hover:shadow-2xl`}
            style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>User Prompts</h2>
                <div className="flex gap-2">
                    <button
                        onClick={toggleAllPrompts}
                        className={`px-3 py-1.5 rounded-full ${isDarkMode
                                ? "bg-blue-700 hover:bg-blue-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white flex items-center gap-1 transition-all hover-scale active-scale text-sm`}
                        disabled={isSimulating}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {areAllPromptsSelected() ? "Deselect All" : "Select All"}
                    </button>
                    <button
                        onClick={addNewPrompt}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-green-700 hover:bg-green-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Add Prompt
                    </button>
                </div>
            </div>

            {/* Avatar Grid với giới hạn hiển thị */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                {userPrompts.slice(0, showAllPrompts ? userPrompts.length : 20).map((prompt, index) => (
                    <div key={prompt.id} className="relative">
                        {/* Avatar with selection indicator */}
                        <div
                            className={`relative cursor-pointer group ${prompt.selected ? (isDarkMode ? "ring-2 ring-blue-500" : "ring-2 ring-blue-400") : ""
                                } rounded-full transition-all duration-200`}
                            onClick={() => togglePromptSelection(prompt.id)}
                        >
                            {/* Avatar background - sử dụng ảnh baby.png */}
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center hover:shadow-lg transition-all mx-auto">
                                <img
                                    src="./images/baby.png"
                                    alt={`Prompt ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                                    }}
                                />
                            </div>

                            {/* Selection checkmark */}
                            {prompt.selected && (
                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg border-2 border-gray-900">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}

                            {/* Content preview on hover */}
                            <div className={`absolute invisible group-hover:visible w-80 p-3 z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 rounded-lg shadow-xl ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                } text-xs border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="font-bold mb-1">Prompt {index + 1}</div>
                                <div className="text-xs whitespace-pre-wrap">
                                    {prompt.content || "Empty prompt"}
                                </div>
                            </div>
                        </div>

                        {/* Prompt name/label below avatar */}
                        <div className={`text-center mt-1 text-xs truncate ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {prompt.content.split('\n')[1]?.replace('User: ', '') || `User ${index + 1}`}
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút "Xem thêm" nếu có nhiều hơn 20 prompt */}
            {userPrompts.length > 20 && (
                <div className="text-center mt-4 mb-4">
                    <button
                        onClick={() => setShowAllPrompts(!showAllPrompts)}
                        className={`px-4 py-2 rounded-lg ${isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            } transition-all hover-scale active-scale`}
                    >
                        {showAllPrompts ? "Ẩn bớt" : `Xem thêm (${userPrompts.length - 20})`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserPrompts;