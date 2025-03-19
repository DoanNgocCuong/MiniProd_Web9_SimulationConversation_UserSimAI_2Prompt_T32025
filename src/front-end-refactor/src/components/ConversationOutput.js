import React, { useState, useEffect } from 'react';
import { genFeedback } from './genFeedback';

const ConversationOutput = ({
    conversations,
    isDarkMode,
    resetSimulation,
    startSimulation,
    isSimulating,
    userPrompts,
    formatTime,
    dod
}) => {
    const [conversationsState, setConversations] = useState(conversations);

    // Thêm log để kiểm tra dod
    useEffect(() => {
        console.log('=== ConversationOutput Props ===');
        console.log('DoD received:', dod);
        console.log('=========================');
    }, [dod]);

    // Theo dõi thay đổi của conversations để tự động gen feedback
    useEffect(() => {
        if (conversations.length > 0 && !isSimulating) {
            // Tự động gen feedback cho các conversation mới
            conversations.forEach(async (conversation) => {
                if (!conversation.result) {
                    await generateFeedback(conversation);
                }
            });
        }
        setConversations(conversations);
    }, [conversations, isSimulating]);

    const generateFeedback = async (conversation) => {
        try {
            const feedback = await genFeedback(conversation, dod);
            conversation.result = feedback;
            setConversations([...conversationsState]);
        } catch (error) {
            console.error('Error generating feedback:', error);
        }
    };

    return (
        <div className={`backdrop-blur-xl bg-opacity-80 p-5 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl animate-fade-in mt-4 flex-1 flex flex-col`}
            style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Conversation Output
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={resetSimulation}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-yellow-600 hover:bg-yellow-500"
                                : "bg-yellow-500 hover:bg-yellow-400"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Reset
                    </button>
                    <button
                        onClick={startSimulation}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-green-700 hover:bg-green-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating || !userPrompts.some(p => p.selected)}
                    >
                        {isSimulating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Simulating...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Start Simulation
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Conversation section with horizontal scroll */}
            {conversations.length > 0 ? (
                <div className="flex-1 overflow-y-hidden">
                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <div className="inline-flex gap-4 p-2">
                            {conversations.map((conversation, index) => (
                                <div
                                    key={index}
                                    className={`w-[400px] h-[calc(100vh-500px)] flex-shrink-0 flex flex-col rounded-xl shadow-md transition-all ${
                                        isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                                    }`}
                                >
                                    {/* Result Box */}
                                    <div className="p-3 rounded-t-xl border-b bg-gray-800/50 border-gray-700">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                conversation?.result?.status === 'pass'
                                                    ? 'bg-green-900/50 text-green-300'
                                                    : 'bg-red-900/50 text-red-300'
                                            }`}>
                                                {conversation?.result?.status?.toUpperCase() || 'PENDING'}
                                            </span>
                                            <span className="text-sm text-gray-300">
                                                Score: {conversation?.result?.score || 0}/100
                                            </span>
                                            {!isSimulating && (
                                                <button
                                                    onClick={() => generateFeedback(conversation)}
                                                    className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300 hover:bg-blue-800/50"
                                                >
                                                    {conversation.result ? 'Regenerate Feedback' : 'Generate Feedback'}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {conversation?.result?.explanation || 'Waiting for analysis...'}
                                        </p>
                                    </div>

                                    {/* Header với thông tin người dùng */}
                                    <div className={`p-3 flex items-center gap-2 ${
                                        isDarkMode ? "bg-gray-700/50" : "bg-gray-100/80"
                                    }`}>
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-500">
                                            <img
                                                src="./images/baby.png"
                                                alt={`User ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                                {conversation.userInfo?.split('\n')[1]?.trim() || `User ${index + 1}`}
                                            </h4>
                                            <p className={`text-xs truncate ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                                                {conversation.userInfo?.split('\n')[2]?.replace('Age & Level:', '').trim() || "Unknown level"}
                                            </p>
                                        </div>
                                        <div className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? "bg-blue-900/50 text-blue-200" : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {conversation.messages?.length || 0} msgs
                                        </div>
                                    </div>

                                    {/* Khu vực tin nhắn */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar"
                                        style={{ backgroundColor: isDarkMode ? "rgba(17, 24, 39, 0.7)" : "rgba(249, 250, 251, 0.7)" }}>
                                        {conversation.messages?.map((msg, msgIndex) => (
                                            <div key={msgIndex} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                                        ? isDarkMode ? 'bg-blue-800 text-white' : 'bg-blue-500 text-white'
                                                        : isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
                                                    }`}>
                                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                                    <div className={`text-xs mt-1 ${msg.role === 'user'
                                                            ? isDarkMode ? 'text-blue-300' : 'text-blue-100'
                                                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                                        }`}>
                                                        {formatTime(msg.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer với thông tin tổng kết */}
                                    <div className={`p-2 text-xs border-t ${isDarkMode ? "border-gray-700 bg-gray-800 text-gray-400" : "border-gray-200 bg-gray-50 text-gray-500"
                                        }`}>
                                        <div className="flex justify-between">
                                            <span>Tổng lượt: {conversation.messages?.length || 0}</span>
                                            <span>Cập nhật: {conversation.messages?.length > 0 ? formatTime(conversation.messages[conversation.messages.length - 1].timestamp) : "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`flex flex-col items-center justify-center py-16 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium mb-2">No conversations yet</p>
                    <p className="text-sm max-w-md text-center mb-6">Select one or more user prompts and click "Start Simulation" to begin generating conversations.</p>
                    <button
                        onClick={startSimulation}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-blue-700 hover:bg-blue-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating || !userPrompts.some(p => p.selected)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Start Simulation
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConversationOutput;