import React from 'react';
import ReactDOM from 'react-dom';

// Hàm định dạng nội dung tin nhắn, xử lý code blocks và các định dạng khác
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

// Create the application component
const AIConversationSimulator = () => {
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

    // Cập nhật hàm tạo dữ liệu mẫu cho conversations với cuộc hội thoại thực tế hơn
    const generateMockData = (selectedPrompts) => {
        return selectedPrompts.map(prompt => {
            // Trích xuất thông tin từ prompt
            const contentLines = prompt.content.split('\n');
            const nameLine = contentLines.find(line => line.trim().startsWith('User:'));
            const ageLine = contentLines.find(line => line.trim().startsWith('Age & Level:'));
            const personalityLine = contentLines.find(line => line.trim().startsWith('Personality:'));

            // Trích xuất tên và tuổi
            const userName = nameLine ? nameLine.replace('User:', '').trim() : 'Unknown User';
            const ageMatch = ageLine ? ageLine.match(/(\d+)\s+years/) : null;
            const age = ageMatch ? parseInt(ageMatch[1]) : 5;

            // Xác định tính cách
            const personality = personalityLine ? personalityLine.replace('Personality:', '').trim() : '';
            const isStubborn = personality.toLowerCase().includes('stubborn') ||
                personality.toLowerCase().includes('resist') ||
                userName.includes('Bear') ||
                userName.includes('Tit');

            const isPlayful = personality.toLowerCase().includes('playful') ||
                personality.toLowerCase().includes('curious') ||
                userName.includes('Lu') ||
                userName.includes('Bao');

            const isIntelligent = personality.toLowerCase().includes('intelligent') ||
                personality.toLowerCase().includes('smart') ||
                userName.includes('An') ||
                userName.includes('Nam');

            // Tạo messages mẫu dựa trên thông tin người dùng
            const now = new Date();

            // Các mẫu hội thoại khác nhau dựa trên đặc điểm trẻ
            let messages = [];

            if (isStubborn) {
                // Cuộc trò chuyện cho trẻ cứng đầu
                messages = [
                    {
                        role: 'assistant',
                        content: 'Xin chào! Hôm nay chúng ta sẽ học về các con vật. Bạn thích con vật nào nhất?',
                        timestamp: new Date(now.getTime() - 60000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ không thích. Chán lắm.',
                        timestamp: new Date(now.getTime() - 50000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Vậy chúng ta học về màu sắc nhé? Đây là màu đỏ 🔴',
                        timestamp: new Date(now.getTime() - 40000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ biết rồi. Không thích học.',
                        timestamp: new Date(now.getTime() - 30000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Hay là chơi trò chơi đoán hình? Nhìn hình này giống cái gì?',
                        timestamp: new Date(now.getTime() - 20000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Không muốn chơi. Tớ muốn xem video.',
                        timestamp: new Date(now.getTime() - 10000).toISOString()
                    }
                ];
            } else if (isPlayful) {
                // Cuộc trò chuyện cho trẻ hiếu động, thích chơi
                messages = [
                    {
                        role: 'assistant',
                        content: 'Xin chào! Hôm nay chúng ta sẽ học về màu sắc bằng trò chơi. Bạn thích không?',
                        timestamp: new Date(now.getTime() - 60000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ thích chơi. Chơi gì vậy?',
                        timestamp: new Date(now.getTime() - 50000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Trò chơi tìm đồ vật có màu đỏ. Bạn có thể tìm được không?',
                        timestamp: new Date(now.getTime() - 40000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Quả táo đỏ. Áo đỏ nữa.',
                        timestamp: new Date(now.getTime() - 30000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Giỏi lắm! Bây giờ tìm đồ vật màu xanh nhé?',
                        timestamp: new Date(now.getTime() - 20000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ thấy lá cây. Bầu trời xanh nữa.',
                        timestamp: new Date(now.getTime() - 10000).toISOString()
                    }
                ];
            } else if (isIntelligent) {
                // Cuộc trò chuyện cho trẻ thông minh
                messages = [
                    {
                        role: 'assistant',
                        content: 'Hôm nay chúng ta sẽ học về động vật và môi trường sống của chúng. Bạn đã biết con vật nào sống dưới nước?',
                        timestamp: new Date(now.getTime() - 60000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Cá sống dưới nước. Cá voi nữa.',
                        timestamp: new Date(now.getTime() - 50000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Rất tốt! Còn động vật nào sống trên cạn?',
                        timestamp: new Date(now.getTime() - 40000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Chó sống trên cạn. Hổ báo sư tử.',
                        timestamp: new Date(now.getTime() - 30000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Bạn biết nhiều quá! Vậy còn động vật sống được cả trên cạn và dưới nước?',
                        timestamp: new Date(now.getTime() - 20000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ biết ếch nhái. Cá sấu cũng được.',
                        timestamp: new Date(now.getTime() - 10000).toISOString()
                    }
                ];
            } else {
                // Cuộc trò chuyện mặc định cho các trẻ khác
                messages = [
                    {
                        role: 'assistant',
                        content: 'Chào bạn! Hôm nay chúng ta sẽ học từ vựng về các loài động vật. Bạn thích con vật nào?',
                        timestamp: new Date(now.getTime() - 60000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ thích mèo. Mèo dễ thương.',
                        timestamp: new Date(now.getTime() - 50000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Mèo tiếng Anh là "cat". Bạn có thể đọc theo không? C-A-T.',
                        timestamp: new Date(now.getTime() - 40000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Cát. Tớ thích mèo cát.',
                        timestamp: new Date(now.getTime() - 30000).toISOString()
                    },
                    {
                        role: 'assistant',
                        content: 'Giỏi lắm! Bạn thích con vật nào nữa không?',
                        timestamp: new Date(now.getTime() - 20000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ thích chó. Chó trung thành.',
                        timestamp: new Date(now.getTime() - 10000).toISOString()
                    }
                ];
            }

            // Thêm độ ngẫu nhiên cho thời gian
            messages.forEach((msg, index) => {
                const randomOffset = Math.floor(Math.random() * 5000);
                const baseTime = now.getTime() - ((6 - index) * 10000) - randomOffset;
                msg.timestamp = new Date(baseTime).toISOString();
            });

            // Đảm bảo luôn có ít nhất 2 tin nhắn
            if (messages.length === 0) {
                messages = [
                    {
                        role: 'assistant',
                        content: 'Xin chào! Bạn thích học về chủ đề gì?',
                        timestamp: new Date(now.getTime() - 20000).toISOString()
                    },
                    {
                        role: 'user',
                        content: 'Tớ thích học về động vật.',
                        timestamp: new Date(now.getTime() - 10000).toISOString()
                    }
                ];
            }

            return {
                userInfo: prompt.content,
                messages: messages,
                showDetails: false
            };
        });
    };

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
                    apiEndpoint = `http://localhost:8080/${apiEndpoint}`;
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
        <div className={`min-h-screen p-4 ${isDarkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 dark" : "bg-gradient-to-b from-gray-50 to-white"} text-gray-900`}>
            <div className="max-w-6xl mx-auto">
                {/* Header with Dark Mode Toggle */}
                <div className="sticky top-0 z-50 backdrop-blur-lg bg-opacity-70 p-4 rounded-2xl mb-6 flex justify-between items-center">
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

                {/* Agent Mode Selection - Thu gọn và tối ưu */}
                <div className={`backdrop-blur-xl bg-opacity-80 p-4 rounded-2xl shadow-xl mb-4 transform transition-all duration-300 hover:shadow-2xl`}
                    style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
                >
                    <div className="flex flex-col">
                        {/* Agent Mode Selection */}
                        <div className="flex items-center justify-between mb-2">
                            <label className={`font-medium text-base ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                Agent Mode
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="promptModeRadio"
                                        name="agentMode"
                                        className="mr-1.5 w-4 h-4"
                                        checked={agentMode === "prompt"}
                                        onChange={() => setAgentMode("prompt")}
                                    />
                                    <label htmlFor="promptModeRadio" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                        Use Prompt
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="bot_id_mode"
                                        name="agent_mode"
                                        value="bot_id"
                                        checked={agentMode === "bot_id"}
                                        onChange={() => setAgentMode("bot_id")}
                                        className="w-4 h-4 mr-1.5"
                                        disabled={isSimulating}
                                    />
                                    <label htmlFor="bot_id_mode" className={`text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                        Use Bot ID
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Bot ID và Max Turn - hiển thị ngay dưới Agent Mode */}
                        {agentMode === "bot_id" && (
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <div>
                                    <label className={`block mb-1 text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                        Bot ID:
                                    </label>
                                    <input
                                        type="number"
                                        value={botId}
                                        onChange={(e) => setBotId(parseInt(e.target.value) || 16)}
                                        placeholder="Enter Bot ID"
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white/50 border-gray-200 text-black"
                                            }`}
                                        disabled={isSimulating}
                                    />
                                </div>
                                <div>
                                    <label className={`block mb-1 text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                        Max Turns:
                                    </label>
                                    <input
                                        type="number"
                                        value={maxTurns}
                                        onChange={(e) => setMaxTurns(parseInt(e.target.value) || 5)}
                                        min="1"
                                        max="20"
                                        className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white/50 border-gray-200 text-black"
                                            }`}
                                        disabled={isSimulating}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Agent Prompt Input (only shown in prompt mode) */}
                        {agentMode === "prompt" && (
                            <div className="mt-2">
                                <label className={`block mb-1 text-sm ${isDarkMode ? "text-white" : "text-gray-700"}`}>
                                    Agent Prompt:
                                </label>
                                <textarea
                                    value={agentPrompt}
                                    onChange={(e) => setAgentPrompt(e.target.value)}
                                    placeholder="Enter Agent Prompt"
                                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-white" : "bg-white/50 border-gray-200 text-black"
                                        }`}
                                    rows="3"
                                    disabled={isSimulating}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* User Prompts Section */}
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

                                    {/* Content preview on hover - FIXED: Changed z-index to ensure it appears above other elements */}
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

                {/* Conversation Output Section - FIXED: Added margin-top to ensure separation */}
                <div className={`backdrop-blur-xl bg-opacity-80 p-5 rounded-2xl shadow-xl mb-6 transform transition-all duration-300 hover:shadow-2xl animate-fade-in mt-8`}
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

                    {/* Hiển thị kết quả mô phỏng */}
                    {conversations.length > 0 ? (
                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {conversations.map((conversation, index) => (
                                    <div
                                        key={index}
                                        className={`h-[400px] flex flex-col rounded-xl shadow-md transition-all ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                                            }`}
                                    >
                                        {/* Header với thông tin người dùng */}
                                        <div className={`p-3 rounded-t-xl flex items-center gap-2 ${isDarkMode ? "bg-gray-700/50" : "bg-gray-100/80"
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

                {/* Footer với thông tin tác giả */}
                <div className={`backdrop-blur-xl bg-opacity-80 p-4 rounded-2xl shadow-xl mb-6 transform transition-all duration-300 hover:shadow-2xl`}
                    style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center gap-3 mb-3 md:mb-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500">
                                <img
                                    src="./images/DoanNgocCuong.png"
                                    alt="Doan Ngoc Cuong"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className={`font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                                    Doan Ngoc Cuong
                                </h3>
                                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    AI Team
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <a
                                href="https://github.com/DoanNgocCuong/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                                </svg>
                                GitHub
                            </a>
                            <a
                                href="https://www.linkedin.com/in/doan-ngoc-cuong/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z" />
                                </svg>
                                LinkedIn
                            </a>
                            <a
                                href="https://www.facebook.com/doanngoccuong.nhathuong"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                                </svg>
                                Facebook
                            </a>
                        </div>
                    </div>

                    <div className="mt-3 text-center">
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            © 2025 AI Conversation Simulator | MiniProd_Web9_SimulationConversation_UserSimAI_2Prompt_T32025
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReactDOM.render(<AIConversationSimulator />, document.getElementById('root'));