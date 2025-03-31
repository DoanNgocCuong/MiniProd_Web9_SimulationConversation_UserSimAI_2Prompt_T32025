// Import các thư viện cần thiết từ React và component genFeedback
import React, { useState, useEffect } from 'react';
import { genFeedback } from './genFeedback';

// Add these functions at the top of your file, after the imports
const formatConversationToJson = (messages) => {
    const formattedConversation = messages.map(msg => ({
        character: msg.role === 'user' ? 'USER' : 'BOT_RESPONSE_CONVERSATION',
        content: msg.content
    }));
    return formattedConversation; // Return array instead of string
};

const convert_to_postman_body = (data, user_intro = "") => {
    let output = user_intro + "\\n";
    for (const item of data) {
        if (item.character === "USER") {
            output += "User: " + item.content + "\\n";
        } else if (item.character === "BOT_RESPONSE_CONVERSATION") {
            output += "Bot: " + item.content + "\\n";
        }
    }
    return output.slice(0, -2); // Remove the last \n
};

// Report Popup Component
const ReportPopup = ({ data, setShowReportPopup, setReportData, isGeneratingReport, error }) => {
    // Define column order and display names
    const columnOrder = [
        "Pika - Câu nói chính",
        "Câu trả lời trước kia kid",
        "Pika - câu fast response",
        "Câu trả lời của kid",
        "Độ dễ hiểu của từ ngữ",
        "Độ dễ hiểu của nội dung",
        "Độ phức tạp của yêu cầu",
        "Độ khó của yêu cầu",
        "Vi phạm quy chuẩn nội dung",
        "Trẻ trả lời được",
        "Dự đoán cảm xúc của trẻ"
    ];

    if (!data && !isGeneratingReport && !error) return null;

    const displayData = error ? null : data;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Report Results</h2>
                    <button
                        onClick={() => {
                            setShowReportPopup(false);
                            setReportData(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-auto max-h-[calc(90vh-8rem)]">
                    {isGeneratingReport ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            <span className="ml-2 text-gray-700 dark:text-gray-300">Generating report...</span>
                        </div>
                    ) : displayData ? (
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            {columnOrder.map((column, index) => (
                                                <th
                                                    key={index}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                                >
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {displayData.choices[0].message.content.conversation.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                                                {columnOrder.map((column, colIndex) => (
                                                    <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                                        {row[column] || '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 text-red-700 dark:text-red-200">
                                {error ? error.message : 'Failed to generate report'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Định nghĩa component ConversationOutput nhận vào các props
const ConversationOutput = ({
    conversations, // Danh sách các cuộc hội thoại
    isDarkMode, // Trạng thái dark mode
    resetSimulation, // Hàm reset lại mô phỏng
    startSimulation, // Hàm bắt đầu mô phỏng
    isSimulating, // Trạng thái đang mô phỏng
    userPrompts, // Danh sách các prompt người dùng
    formatTime, // Hàm format thởi gian
    dod // Định nghĩa về độ khó (Definition of Done)
}) => {
    // Khởi tạo state để lưu trữ conversations
    const [conversationsState, setConversations] = useState(conversations);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [error, setError] = useState(null);

    // useEffect để log ra dod mỗi khi nó thay đổi
    useEffect(() => {
        console.log('=== ConversationOutput Props ===');
        console.log('DoD received:', dod);
        console.log('=========================');
    }, [dod]);

    // useEffect theo dõi thay đổi của conversations để tự động tạo feedback
    useEffect(() => {
        // Kiểm tra có conversations và không đang trong quá trình mô phỏng
        if (conversations.length > 0 && !isSimulating) {
            // Duyệt qua từng conversation để tạo feedback
            conversations.forEach(async (conversation) => {
                // Chỉ tạo feedback cho conversation chưa có kết quả
                if (!conversation.result) {
                    await generateFeedback(conversation);
                }
            });
        }
        // Cập nhật state conversations
        setConversations(conversations);
    }, [conversations, isSimulating]);

    // Hàm tạo feedback cho một conversation
    const generateFeedback = async (conversation) => {
        try {
            // Gọi API để tạo feedback
            const feedback = await genFeedback(conversation, dod);
            // Gán kết quả feedback vào conversation
            conversation.result = feedback;
            // Cập nhật state để render lại UI
            setConversations([...conversationsState]);
        } catch (error) {
            console.error('Lỗi khi tạo phản hồi:', error);
        }
    };

    // Hàm gọi API để generate report
    const generateReport = async () => {
        try {
            setIsGeneratingReport(true);
            console.log(conversationsState);
            
            // Format conversation data from the current state
            const conversationText = conversationsState.map(conv => {
                const messages = [];
                if (conv.userMessage) {
                    messages.push(`User: ${conv.userMessage}`);
                }
                if (conv.botMessage) {
                    messages.push(`Bot: ${conv.botMessage}`);
                }
                if (conv.result) {
                    messages.push(`Result: ${JSON.stringify(conv.result)}`);
                }
                return messages.join('\n');
            }).join('\n\n'); // Add extra newline between conversations

            console.log('Sending conversation:', conversationText);

            // Make API call to our backend
            const response = await fetch('http://localhost:25050/generate-report', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversation: "Bot: Bíp bíp! Vậy món ăn yêu thích của cậu là gì? 🤔\\nUser: Pika đã nghe thấy rồi đó 🤔\\nBot: Ôi, cậu thích món \"welcome\" à? Nghe lạ quá! Trên hành tinh Mars, tớ đã thử một món ăn gọi là \"Martian welcome\" - đó là một loại bánh hình tròn, nhưng nó có màu xanh lá cây và có vị rất nhạt! Thật buồn cười khi mọi người ăn nó và nhảy múa vì vị ngọt quá! Cậu có thích ăn bánh không?\\nUser: I have seen it but I find it so funny so I don't know what the cake is called. So I find it so strange. Then I laugh again.\\nBot: U ki, cậu mình một chút!\\nUser: Haha, cậu thấy món bánh đó! Cậu có thích ăn bánh ngọt không? Hay cậu thích món mặn?"
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate report');
            }

            const data = await response.json();
            setReportData(data);
            setShowReportPopup(true);
        } catch (error) {
            console.error('Error generating report:', error);
            setError(error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Render giao diện chính của component
    return (
        // Container chính với hiệu ứng blur và màu nền tùy thuộc dark mode
        <div className={`backdrop-blur-xl bg-opacity-80 p-5 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl animate-fade-in mt-4 flex-1 flex flex-col`}
            style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
        >
            {/* Phần header chứa tiêu đề và các nút điều khiển */}
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    Kết quả cuộc trò chuyện
                </h2>
                <div className="flex gap-2">
                    {/* Nút Reset để làm mới mô phỏng */}
                    <button
                        onClick={resetSimulation}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-yellow-600 hover:bg-yellow-500"
                                : "bg-yellow-500 hover:bg-yellow-400"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Reset
                    </button>
                    {/* Nút Start để bắt đầu mô phỏng */}
                    <button
                        onClick={startSimulation}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-green-700 hover:bg-green-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating || !userPrompts.some(p => p.selected)}
                    >
                        {/* Hiển thị spinner khi đang mô phỏng */}
                        {isSimulating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang mô phỏng...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                </svg>
                                Bắt đầu mô phỏng
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Phần hiển thị danh sách conversations */}
            {conversations.length > 0 ? (
                // Container cho phép scroll ngang
                <div className="flex-1 overflow-y-hidden">
                    <div className="h-full overflow-x-auto overflow-y-auto">
                        <div className="inline-flex gap-4 p-2">
                            {/* Map qua từng conversation để hiển thị */}
                            {conversations.map((conversation, index) => (
                                <div
                                    key={index}
                                    className={`w-[600px] h-[calc(100vh)] flex-shrink-0 flex flex-col rounded-xl shadow-md transition-all ${
                                        isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                                    }`}
                                >
                                    {/* Phần hiển thị kết quả đánh giá */}
                                    <div className="p-3 rounded-t-xl border-b bg-gray-800/50 border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
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
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Copy JSON Button */}
                                                <button
                                                    onClick={() => {
                                                        const jsonData = formatConversationToJson(conversation.messages || []);
                                                        const formattedText = convert_to_postman_body(jsonData);
                                                        navigator.clipboard.writeText(formattedText);
                                                        // Optional: Add visual feedback
                                                        const btn = document.activeElement;
                                                        const originalText = btn.innerText;
                                                        btn.innerText = 'Copied!';
                                                        setTimeout(() => btn.innerText = originalText, 2000);
                                                    }}
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        isDarkMode
                                                            ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                                            : "bg-gray-200/50 text-gray-700 hover:bg-gray-300/50"
                                                    } flex items-center gap-1`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                    </svg>
                                                    Copy JSON
                                                </button>
                                                {/* Nút tạo lại feedback */}
                                                {!isSimulating && (
                                                    <button
                                                        onClick={() => generateFeedback(conversation)}
                                                        className="px-2 py-1 text-xs rounded-full bg-blue-900/50 text-blue-300 hover:bg-blue-800/50"
                                                    >
                                                        {conversation.result ? 'Regenerate Feedback' : 'Generate Feedback'}
                                                    </button>
                                                )}
                                                {/* Generate Report Button */}
                                                <button
                                                    onClick={generateReport}
                                                    className={`px-3 py-1 text-xs rounded-full ${
                                                        isDarkMode
                                                            ? "bg-purple-900/50 text-purple-300 hover:bg-purple-800/50"
                                                            : "bg-purple-700/50 text-purple-100 hover:bg-purple-600/50"
                                                    } flex items-center gap-1 ml-2`}
                                                    disabled={isGeneratingReport}
                                                >
                                                    {isGeneratingReport ? (
                                                        <>
                                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Generating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h4.586a2 2 0 011.707.293l3.414 3.414a2 2 0 01.293 1.707L12.414 15.414l-3.414-3.414a2 2 0 01-.293-1.707l3.414-3.414z" />
                                                            </svg>
                                                            <span>Generate Report</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {conversation?.result?.explanation || 'Waiting for analysis...'}
                                        </p>
                                    </div>

                                    {/* Phần header hiển thị thông tin người dùng */}
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

                                    {/* Phần hiển thị các tin nhắn trong cuộc hội thoại */}
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

                                    {/* Footer hiển thị thông tin tổng kết */}
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
                // Hiển thị trạng thái trống khi chưa có conversations
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
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        Start Simulation
                    </button>
                </div>
            )}

            {/* Report Popup */}
            {showReportPopup && <ReportPopup data={reportData} setShowReportPopup={setShowReportPopup} setReportData={setReportData} isGeneratingReport={isGeneratingReport} error={error} />}
        </div>
    );
};

export default ConversationOutput;