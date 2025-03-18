import React from 'react';

const AgentMode = ({
    agentMode,
    setAgentMode,
    botId,
    setBotId,
    maxTurns,
    setMaxTurns,
    agentPrompt,
    setAgentPrompt,
    isSimulating,
    isDarkMode
}) => {
    return (
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
    );
};

export default AgentMode;