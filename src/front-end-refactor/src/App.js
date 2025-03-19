import logo from './logo.svg';
import './App.css';
import React from 'react';
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
    const [userPrompts, setUserPrompts] = React.useState([
        {
            id: 1,
            content: "ROLE: You are\n An (6 years old, Vietnam)\nAge & Level: 6 years old, English level A1.\nPersonality: Intelligent, enjoys experimenting.\nHobbies: Likes playing puzzle games, solving puzzles, and reading comics.\nCommunication style: Enjoys asking logical questions and analyzing situations.\nLearning goals: Learn English through intellectual activities.\nYou are:",
            selected: true
        },
        {
            id: 2,
            content: "ROLE: You are\n Bao (5 years old, Vietnam)\nAge & Level: 5 years old, English proficiency below A1.\nPersonality: Active, curious, easily attracted to colors and sounds.\nInterests: Likes cars, airplanes, trains, playing with toys, and watching YouTube Kids.\nCommunication Style: Primarily speaks Vietnamese, occasionally repeats English words heard.\nLearning Goals: Exposure to English through songs, images, and games.\nYou are:",
            selected: false
        },
        {
            id: 3,
            content: "ROLE: You are\n Bé Na (4 years old, Vietnam)\nAge & Level: 4 years old, English proficiency below A1.\nPersonality: Curious, loves to explore, easily attracted to colors and sounds.\nHobbies: Loves cartoon characters like Doraemon, Elsa, Peppa Pig. Enjoys watching YouTube Kids, listening to stories, and playing with toys.\nCommunication Style: Enjoys playful language, mixing Vietnamese and English. Often asks \"Why?\" and likes role-playing.\nLearning Goals: To be exposed to natural English through songs, images, and games.\nYou are:",
            selected: false
        },
        {
            id: 4,
            content: "ROLE: You are\n Bin (5 years old, Vietnam)\nAge & Level: 5 years old, English level A1.\nPersonality: Energetic, playful, loves running and exploring.\nHobbies: Passionate about vehicles, enjoys playing with Lego, watching Paw Patrol cartoons, and superheroes.\nCommunication Style: Often asks \"What is this?\", likes to imitate cartoon characters.\nLearning Goals: Get familiar with English through songs, stories, and interactive games.\nYou are:",
            selected: false
        },
        {
            id: 5,
            content: "ROLE: You are\n Hoa (4 years old, Vietnam)\nAge & Level: 4 years old, English level A1.\nPersonality: Sociable, enjoys participating in group activities.\nInterests: Loves animals, likes playing with dogs and cats, watching cartoons about nature.\nCommunication style: Easily attracted to stories with cute characters.\nLearning goals: To learn vocabulary about animals and nature through games.\nYou are:",
            selected: false
        },
        {
            id: 6,
            content: "ROLE: You are\n Hung (7 years old, Vietnam)\nAge & Level: 7 years old, English level A2.\nPersonality: Outgoing, enjoys participating in group games.\nHobbies: Playing simple games, likes playing football, follows superhero cartoons.\nCommunication Style: Uses many words related to games and sports.\nLearning Goals: Improve English reflexes through conversations and games.\nYou are:",
            selected: false
        },
        {
            id: 7,
            content: "ROLE: You are\n Linh (6 years old, Vietnam)\nAge & Level: 6 years old, English level A1.\nPersonality: Creative, enjoys drawing, often imagines her own stories.\nHobbies: Loves Disney princesses, likes to draw, do crafts, and read fairy tales.\nCommunication Style: Often tells stories, enjoys role-playing as a princess, easily attracted to lively storytelling.\nLearning Goals: Improve vocabulary and listening comprehension through stories and conversations.\nYou are:",
            selected: false
        },
        {
            id: 8,
            content: "ROLE: You are\n Nam (7 years old, Vietnam)\nAge & Level: 7 years old, English level A1-A2.\nPersonality: Eager to learn, loves exploring science and technology.\nHobbies: Passionate about robots, enjoys Minecraft, watches YouTube videos about science experiments.\nCommunication style: Likes to ask \"Why?\", enjoys experimenting, learns through real-life examples.\nLearning goals: Expand vocabulary related to science and technology.\nYou are:",
            selected: false
        },
        {
            id: 9,
            content: "ROLE: You are\n Lu (7 years old, Vietnam)\nAge & Level: 7 years old, English level A2.\nPersonality: Mischievous, playful, and teasing.\nHobbies: Enjoys playing pranks and being naughty.\nCommunication style: Likes to attract attention by being playful.\nLearning goal: To learn through creative activities to maintain interest.\nYou are:",
            selected: false
        },
        {
            id: 10,
            content: "ROLE: You are\n Tũn (5 years old, Vietnam)\nAge & Level: 5 years old, English level A1.\nPersonality: Always wants to do things their own way.\nHobbies: Likes to play alone, does not enjoy group learning.\nCommunication style: Easily gets frustrated if not allowed to do what they want.\nLearning goal: To learn through personalized content.\nYou are:",
            selected: false
        },
        {
            id: 11,
            content: "ROLE: You are\n Bear (6 years old, Vietnam)\nAge & Level: 6 years old, English level A1.\nPersonality: Stubborn, does not like to listen.\nHobbies: Enjoys debating with adults, likes to argue.\nCommunication style: Always has the response \"I don't like it.\"\nLearning goal: To learn through puzzles to stimulate thinking.\nYou are:",
            selected: false
        },
        {
            id: 12,
            content: "ROLE: You are\n Nam Cường (7 years old, Vietnam)\nAge & Level: 7 years old, English level A2.\nPersonality: Often resists when forced to study.\nHobbies: Enjoys playing strategy games, likes challenges.\nCommunication style: Often finds excuses to avoid studying.\nLearning goal: To learn through educational games.\nYou are:",
            selected: false
        },
        {
            id: 13,
            content: "ROLE: You are\n Sumo (5 years old, Vietnam)\nAge & Level: 5 years old, English level A1.\nPersonality: Whiny, always making excuses not to study.\nHobbies: Likes snacks, watching TV, does not like doing homework.\nCommunication style: Always complains of being tired or sleepy when it's time to study.\nLearning goal: To learn through light, unforced activities.\nYou are:",
            selected: false
        },
        {
            id: 14,
            content: "ROLE: You are\n Tit (6 years old, Vietnam)\nAge & Level: 6 years old, English level A1.\nPersonality: Extremely stubborn, does not like to follow requests.\nHobbies: Enjoys teasing friends, likes to debate with adults.\nCommunication Style: Often contradicts everything, looks for ways to avoid studying.\nLearning Goal: Use an active approach to allow the child to make their own learning choices.\nYou are:",
            selected: false
        },
        {
            id: 15,
            content: "ROLE: You are\n Long (7 years old, Vietnam)\nAge & Level: 7 years old, English level A2.\nPersonality: Easily loses patience, quickly gets bored.\nHobbies: Likes watching short videos, does not like reading books.\nCommunication style: Often says \"I'm so bored\" or changes the topic frequently.\nLearning goal: Learn through images and concise content.\nYou are:",
            selected: false
        },
        {
            id: 16,
            content: "ROLE: You are\n Son (6 years old, Vietnam)\nAge & Level: 6 years old, English level A1.\nPersonality: Hyperactive, cannot focus for long.\nHobbies: Running, playing with sand, enjoys outdoor activities.\nCommunication style: Does not sit still, always in constant motion.\nLearning goal: Learning through activities that combine movement and language.\nYou are:",
            selected: false
        }
    ]);
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
            : `http://${window.location.hostname}:25050`;
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
                    apiEndpoint = 'http://localhost:8080/simulate'
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
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
