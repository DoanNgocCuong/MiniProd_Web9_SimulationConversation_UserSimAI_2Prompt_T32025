import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import UserPrompts from './components/UserPrompts'; // Import the new component
import ConversationOutput from './components/ConversationOutput'; // Import the new component
import AgentMode from './components/AgentMode'; // Import the new component
import Header from './components/Header'; // Import the Header component
import { generateMockData } from './components/generateMockData'; // Import the generateMockData function

function App() {
    const formatMessageContent = (content) => {
        if (!content) return "";
    
        // Kiểm tra xem content có phải là object không
        if (typeof content === 'object') {
            return JSON.stringify(content, null, 2);
        }
    
        // Xử lý code blocks (nếu có)
        let formattedContent = content;
    
        // Trả về nội dung đã định dạng
        return formattedContent;
    };
    
    // Hàm chuyển đổi nội dung prompt từ định dạng cũ sang định dạng mới
    const updatePromptFormat = (oldContent) => {
        // Chỉ cập nhật nếu chưa được cập nhật (bắt đầu bằng "ROLE: You are")
        if (!oldContent.startsWith("ROLE: You are")) {
            return oldContent; // Đã được cập nhật rồi
        }
    
        // Trích xuất phần thông tin user từ nội dung cũ
        const userInfoPart = oldContent
            .replace("ROLE: You are\n", "") // Bỏ phần "ROLE: You are"
            .replace("\nYou are:", ""); // Bỏ phần "You are:" ở cuối
    
        // Tạo template mới
        return `You are:
    ${userInfoPart}
    ======
    
    TASK: Your task is follow each step the ROBOT guides you.
    
    **RESPONSE TEMPLATE** 
    - Response in Vietnamese. 
    - Super short answers with phrases. 
    - Answer 2-3 phrases max, each phrase 3-4 words. Phrases should be CONTIGUOUS, NOT ON NEW LINES, SEPARATED BY A PERIOD. Contiguous phrases should not go to a new line. 
    - Use "Tớ" for myself and "Cậu" for the user. 
    - NO ICON, and no emoji in output 
    
    You respond extremely briefly.`;
    };
    
    // Cập nhật hàm định dạng thời gian để hiển thị ngắn gọn hơn
    const formatTime = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        // Chỉ hiển thị giờ và phút, không hiển thị giây và AM/PM
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };


    const [agentPrompt, setAgentPrompt] = React.useState("");
    const [userPrompts, setUserPrompts] = React.useState([]);
    const [conversations, setConversations] = React.useState([]);
    const [isSimulating, setIsSimulating] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(true);
    const [connectionStatus, setConnectionStatus] = React.useState("checking");
    const clientIdRef = React.useRef(`client-${Date.now()}`);
    const [agentMode, setAgentMode] = React.useState("bot_id");
    const [botId, setBotId] = React.useState(105);
    const [maxTurns, setMaxTurns] = React.useState(2);
    const [simulationId, setSimulationId] = React.useState(null);
    const [apiUrl, setApiUrl] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [showDebug, setShowDebug] = React.useState(false);
    const [debugData, setDebugData] = React.useState(null);
    const [editingPrompt, setEditingPrompt] = React.useState(null);
    const [showAllPrompts, setShowAllPrompts] = React.useState(false);
    const [dod, setDod] = React.useState("");
    const [hypothesis, setHypothesis] = React.useState("");
    const [designGoal, setDesignGoal] = React.useState("");
    const [keyAssumption, setKeyAssumption] = React.useState("");
    const [measurementMetric, setMeasurementMetric] = React.useState("");

    // Cập nhật danh sách Bot ID hợp lệ
    const validBotIds = [16, 17, 18, 19, 20]; // Thêm các Bot ID khác nếu biết

    // Xác định API URL dựa trên môi trường
    React.useEffect(() => {
        const url = window.location.hostname === 'localhost'
            ? 'http://localhost:25050'
            : `http://103.253.20.13:25050`;
        setApiUrl(url);
        console.log("API URL set to:", url);
    }, []);

    // Kiểm tra kết nối đến backend bằng HTTP
    React.useEffect(() => {
        const checkConnection = async () => {
            if (!apiUrl) return;

            try {
                setConnectionStatus("checking");
                const response = await fetch(`${apiUrl}/health`);
                if (response.ok) {
                    setConnectionStatus("connected");
                    console.log("Backend connection successful");
                } else {
                    setConnectionStatus("error");
                    console.error("Backend returned error:", await response.text());
                }
            } catch (error) {
                console.error("Connection error:", error);
                setConnectionStatus("disconnected");
            }
        };

        // Kiểm tra kết nối ngay lập tức và sau đó mỗi 10 giây
        if (apiUrl) {
            checkConnection();
            const intervalId = setInterval(checkConnection, 10000);
            return () => clearInterval(intervalId);
        }
    }, [apiUrl]);

    // Đảm bảo agentMode luôn là "bot_id" khi khởi động
    React.useEffect(() => {
        setAgentMode("bot_id");
    }, []);

    useEffect(() => {
        const fetchUserPrompts = async () => {
            try {
                const response = await fetch('http://103.253.20.13:25050/get-prompts');
                if (!response.ok) {
                    throw new Error('Failed to fetch user prompts');
                }
                const data = await response.json();
                // Map the data to include id, name, and content
                const formattedPrompts = data.prompts.map(prompt => ({
                    id: prompt.id,
                    name: prompt.name,
                    content: prompt.content,
                    selected: false
                }));
                setUserPrompts(formattedPrompts);
            } catch (error) {
                console.error('Error fetching user prompts:', error);
            }
        };

        fetchUserPrompts();
    }, []);

    const addNewPrompt = () => {
        setUserPrompts([...userPrompts, { id: Date.now(), content: "", selected: true }]);
    };

    const togglePromptSelection = (id) => {
        setUserPrompts(userPrompts.map(prompt =>
            prompt.id === id ? { ...prompt, selected: !prompt.selected } : prompt
        ));
    };

    const updatePromptText = (id, content) => {
        setUserPrompts(userPrompts.map(prompt =>
            prompt.id === id ? { ...prompt, content } : prompt
        ));
    };

    const deletePrompt = (id) => {
        setUserPrompts(userPrompts.filter(prompt => prompt.id !== id));
    };

    const toggleAllPrompts = () => {
        setUserPrompts(userPrompts.map(prompt => ({ ...prompt, selected: !areAllPromptsSelected() })));
    };

    const areAllPromptsSelected = () => {
        return userPrompts.every(prompt => prompt.selected);
    };

    // Thêm đoạn code sau vào componentDidMount hoặc useEffect
    React.useEffect(() => {
        // Cập nhật tất cả các prompt sang định dạng mới
        setUserPrompts(prevPrompts =>
            prevPrompts.map(prompt => ({
                ...prompt,
                content: updatePromptFormat(prompt.content)
            }))
        );
    }, []); // Chỉ chạy một lần khi component được mount

    // Cập nhật hàm startSimulation để xử lý đúng định dạng data từ API
    const startSimulation = async () => {
        if (isSimulating) return;

        // Lấy các prompt đã được chọn
        const selectedPrompts = userPrompts.filter(prompt => prompt.selected);
        if (selectedPrompts.length === 0) {
            alert("Please select at least one prompt to start simulation.");
            return;
        }

        setIsSimulating(true);
        setConversations([]);
        setSimulationId(null);
        setDebugData(null);

        try {
            // Tạo mảng chứa các promise cho nhiều API call
            const apiCalls = selectedPrompts.map(async (prompt) => {
                const requestData = {
                    bot_id: botId,
                    user_prompt: prompt.content,
                    max_turns: maxTurns
                };

                // Kiểm tra nếu đang chạy trên localhost thì dùng CORS proxy
                let apiEndpoint = 'http://103.253.20.13:25050/simulate';

                // Thêm local CORS proxy nếu đang chạy trên localhost
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // apiEndpoint = `http://localhost:8080/${apiEndpoint}`;
                    apiEndpoint = 'http://localhost:25050/simulate'
                }

                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                const data = await response.json();
                console.log("API response data:", data);

                // Chuyển đổi từ cấu trúc API (conversation) sang cấu trúc frontend (messages)
                let messages = [];

                // Kiểm tra nếu có dữ liệu conversation từ API
                if (data.conversation && Array.isArray(data.conversation)) {
                    messages = data.conversation.map(msg => ({
                        role: msg.role.toLowerCase(), // chuyển "User"/"Bot" thành "user"/"assistant"
                        content: msg.content,
                        timestamp: new Date().toISOString() // Thêm timestamp vì API không cung cấp
                    }));
                } else if (data.messages && Array.isArray(data.messages)) {
                    // Nếu API đã trả về dạng messages
                    messages = data.messages;
                } else {
                    console.warn("Unexpected API response format:", data);
                }

                return {
                    userInfo: prompt.content,
                    messages: messages,
                    showDetails: false
                };
            });

            // Chờ tất cả các API call hoàn thành
            const results = await Promise.all(apiCalls);
            setConversations(results);

        } catch (error) {
            console.error("Simulation error:", error);

            // Hiển thị thông báo lỗi chi tiết
            setDebugData({
                info: `Error with API: ${error.message}. Using mock data instead.`,
                error: error.message,
                apiUrl: 'http://103.253.20.13:25050/simulate'
            });

            // Sử dụng dữ liệu mẫu khi API lỗi
            const mockData = generateMockData(selectedPrompts);
            setConversations(mockData);
        } finally {
            setIsSimulating(false);
        }
    };

    const resetSimulation = () => {
        setConversations([]);
        // Cập nhật lại userPrompts với danh sách 46 role nhưng chỉ chọn role đầu tiên
        setUserPrompts(userPrompts.map((prompt, index) => ({
            ...prompt,
            selected: index === 0
        })));
        setAgentPrompt("");
        setIsSimulating(false);
        setDebugData(null);
        setSimulationId(null);
    };

    // Di chuyển hàm toggleConversationDetails vào trong component
    const toggleConversationDetails = (index) => {
        setConversations(prevConversations =>
            prevConversations.map((conv, i) =>
                i === index ? { ...conv, showDetails: !conv.showDetails } : conv
            )
        );
    };

    const handleUpdatePrompts = (newPrompts) => {
        console.log('handleUpdatePrompts called in App.js:', {
            currentPromptsCount: userPrompts.length,
            newPromptsCount: newPrompts.length,
            firstPromptPreview: newPrompts[0]?.content.substring(0, 50) + '...'
        });

        // So sánh prompts cũ và mới
        const changedPrompts = newPrompts.filter((newPrompt, index) => 
            newPrompt.content !== userPrompts[index].content
        );
        
        console.log('Changed prompts:', {
            count: changedPrompts.length,
            changes: changedPrompts.map(p => ({
                id: p.id,
                newContent: p.content.substring(0, 50) + '...'
            }))
        });

        setUserPrompts(newPrompts);
        console.log('State updated in App.js');
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 dark" : "bg-gradient-to-b from-gray-50 to-white"} text-gray-900`}>
            {/* <Header
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                connectionStatus={connectionStatus}
            /> */}

            <div className="flex w-full">
                {/* Agent Mode Section - Left 1/4 of the screen */}
                <div className="w-1/4 pr-4">
                    <AgentMode
                        agentMode={agentMode}
                        setAgentMode={setAgentMode}
                        botId={botId}
                        setBotId={setBotId}
                        maxTurns={maxTurns}
                        setMaxTurns={setMaxTurns}
                        agentPrompt={agentPrompt}
                        setAgentPrompt={setAgentPrompt}
                        isSimulating={isSimulating}
                        isDarkMode={isDarkMode}
                        dod={dod}
                        setDod={setDod}
                        hypothesis={hypothesis}
                        setHypothesis={setHypothesis}
                        designGoal={designGoal}
                        setDesignGoal={setDesignGoal}
                        keyAssumption={keyAssumption}
                        setKeyAssumption={setKeyAssumption}
                        measurementMetric={measurementMetric}
                        setMeasurementMetric={setMeasurementMetric}
                    />
                </div>

                {/* Right Section - 3/4 of the screen */}
                <div className="w-3/4 flex flex-col">
                {/* User Prompts Section */}
                    <UserPrompts
                        userPrompts={userPrompts}
                        toggleAllPrompts={toggleAllPrompts}
                        addNewPrompt={addNewPrompt}
                        togglePromptSelection={togglePromptSelection}
                        areAllPromptsSelected={areAllPromptsSelected}
                        isSimulating={isSimulating}
                        isDarkMode={isDarkMode}
                        showAllPrompts={showAllPrompts}
                        setShowAllPrompts={setShowAllPrompts}
                        onUpdatePrompts={handleUpdatePrompts}
                    />
                    {/* Conversation Output Section */}
                    <ConversationOutput
                        conversations={conversations}
                        isDarkMode={isDarkMode}
                        resetSimulation={resetSimulation}
                        startSimulation={startSimulation}
                        isSimulating={isSimulating}
                        userPrompts={userPrompts}
                        formatTime={formatTime}
                        dod={dod}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
