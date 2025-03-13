import { useState, useEffect, useCallback } from "react";
import { FiPlus, FiTrash2, FiPlay, FiRefreshCw } from "react-icons/fi";

const AIConversationSimulator = () => {
  const [agentPrompt, setAgentPrompt] = useState("");
  const [userPrompts, setUserPrompts] = useState([{ id: 1, text: "", selected: false }]);
  const [conversations, setConversations] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const addNewPrompt = () => {
    setUserPrompts([...userPrompts, { id: userPrompts.length + 1, text: "", selected: false }]);
  };

  const togglePromptSelection = (id) => {
    setUserPrompts(userPrompts.map(prompt =>
      prompt.id === id ? { ...prompt, selected: !prompt.selected } : prompt
    ));
  };

  const updatePromptText = (id, text) => {
    setUserPrompts(userPrompts.map(prompt =>
      prompt.id === id ? { ...prompt, text } : prompt
    ));
  };

  const deletePrompt = (id) => {
    setUserPrompts(userPrompts.filter(prompt => prompt.id !== id));
  };

  const typeWriter = useCallback((text, setTypedText) => {
    let i = 0;
    const typing = setInterval(() => {
      setTypedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(typing);
    }, 50);
    return () => clearInterval(typing);
  }, []);

  const startSimulation = async () => {
    const selectedPrompts = userPrompts.filter(p => p.selected);
    if (selectedPrompts.length === 0) {
      alert("Please select at least one prompt");
      return;
    }
    setIsSimulating(true);
    
    const newConversations = selectedPrompts.map((prompt, index) => ({
      id: Date.now() + index,
      agentPrompt,
      userPrompt: prompt.text,
      messages: []
    }));
    
    setConversations([...conversations, ...newConversations]);
    
    // Simulate conversation
    for (let conv of newConversations) {
      const messages = [
        { role: "agent", text: "Hello! How can I assist you today?" },
        { role: "user", text: conv.userPrompt },
        { role: "agent", text: "I understand your request. Let me help you with that." }
      ];
      
      for (let msg of messages) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConversations(prevConvs => 
          prevConvs.map(c => 
            c.id === conv.id 
              ? { ...c, messages: [...c.messages, msg] }
              : c
          )
        );
      }
    }
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setConversations([]);
    setUserPrompts([{ id: 1, text: "", selected: false }]);
    setAgentPrompt("");
  };

  return (
    <div className={`min-h-screen p-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header Controls */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Agent Prompt Input */}
        <div className="sticky top-0 z-10 bg-opacity-95 p-4 rounded-lg shadow-lg mb-6"
          style={{ backgroundColor: isDarkMode ? "#1a1a1a" : "#ffffff" }}
        >
          <textarea
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder="Enter Agent Prompt"
            className={`w-full p-4 rounded-lg border-2 focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            rows="4"
          />
        </div>

        {/* User Prompts Section */}
        <div className={`p-6 rounded-lg mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">User Prompts</h2>
          <div className="space-y-4">
            {userPrompts.map((prompt) => (
              <div key={prompt.id} className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={prompt.selected}
                  onChange={() => togglePromptSelection(prompt.id)}
                  className="w-5 h-5 rounded text-blue-500"
                />
                <input
                  type="text"
                  value={prompt.text}
                  onChange={(e) => updatePromptText(prompt.id, e.target.value)}
                  placeholder={`User Prompt ${prompt.id}`}
                  className={`flex-1 p-2 rounded-lg border ${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
                />
                <button
                  onClick={() => deletePrompt(prompt.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addNewPrompt}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FiPlus /> Add New Prompt
          </button>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={startSimulation}
            disabled={isSimulating}
            className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center gap-2 ${isSimulating ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white`}
          >
            <FiPlay /> {isSimulating ? "Simulating..." : "Start Simulation"}
          </button>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FiRefreshCw /> Reset
          </button>
        </div>

        {/* Conversations Display */}
        <div className="space-y-6">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-6 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}
            >
              <h3 className="text-lg font-semibold mb-4">Conversation #{conv.id}</h3>
              <div className="space-y-4">
                {conv.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-lg ${msg.role === "agent" ? (isDarkMode ? "bg-blue-900" : "bg-blue-100") : (isDarkMode ? "bg-green-900" : "bg-green-100")}`}
                    >
                      <p className="text-sm font-semibold mb-1">{msg.role === "agent" ? "Agent" : "User"}</p>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIConversationSimulator; 