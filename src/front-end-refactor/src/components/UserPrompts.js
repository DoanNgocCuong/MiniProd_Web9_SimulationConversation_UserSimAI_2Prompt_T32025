// Import thư viện React
import React, { useState } from 'react';

// Component UserPrompts nhận vào các props để quản lý danh sách và trạng thái của các prompts
const UserPrompts = ({
    userPrompts, // Mảng chứa danh sách các prompts
    toggleAllPrompts, // Hàm để chọn/bỏ chọn tất cả prompts
    addNewPrompt, // Hàm để thêm prompt mới
    togglePromptSelection, // Hàm để chọn/bỏ chọn một prompt
    areAllPromptsSelected, // Hàm kiểm tra xem tất cả prompts đã được chọn chưa
    isSimulating, // Trạng thái đang mô phỏng hay không
    isDarkMode, // Trạng thái dark mode
    showAllPrompts, // Trạng thái hiển thị tất cả prompts
    setShowAllPrompts, // Hàm để set trạng thái hiển thị tất cả prompts
    onUpdatePrompts // Hàm để cập nhật danh sách prompts
}) => {
    // Thêm state để quản lý việc edit
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    // Thêm state để quản lý thông báo
    const [saveStatus, setSaveStatus] = useState(null);

    // Log các props khi component được render để debug
    // console.log('UserPrompts component rendered with props:', {
    //     promptsCount: userPrompts.length,
    //     selectedCount: userPrompts.filter(p => p.selected).length,
    //     isSimulating,
    //     isDarkMode,
    //     showAllPrompts
    // });
    
    // Thêm hàm xử lý việc bắt đầu edit
    const handleStartEdit = (promptId, content) => {
        console.log('Starting edit:', {
            promptId,
            content: content.substring(0, 100) + '...',  // Log 100 ký tự đầu
            currentEditingId: editingId
        });
        setEditingId(promptId);
        setEditContent(content);
    };

    // Thêm hàm xử lý việc save
    const handleSavePrompt = async (promptId, newContent) => {
        if (!promptId || !newContent) {
            setSaveStatus('error');
            return;
        }

        try {
            const promptToUpdate = userPrompts.find(prompt => prompt.id === promptId);
            const response = await fetch('http://127.0.0.1:25050/update-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: promptId,
                    name: promptToUpdate.name,
                    content: newContent
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update prompt');
            }

            const updatedPrompts = userPrompts.map(prompt => {
                if (prompt.id === promptId) {
                    return { 
                        ...prompt,
                        content: newContent
                    };
                }
                return prompt;
            });

            onUpdatePrompts(updatedPrompts);
            setSaveStatus('success');
            setTimeout(() => {
                setEditingId(null);
                setSaveStatus(null);
            }, 1000);
        } catch (error) {
            console.error('Error updating prompt:', error);
            setSaveStatus('error');
        }
    };

    // Thêm hàm để xử lý hiển thị tên người dùng từ nội dung prompt
    const getUserNameFromContent = (content) => {
        try {
            // // Log để debug
            // console.log('Getting username from content:', {
            //     content: content?.substring(0, 50) + '...',
            //     firstLines: content?.split('\n').slice(0, 2)
            // });

            const lines = content?.split('\n');
            if (!lines || lines.length < 2) return 'Unknown User';
            
            // Lấy dòng thứ 2 và xử lý
            const nameLine = lines[1].trim();
            return nameLine.replace('User: ', '') || 'Unknown User';
        } catch (error) {
            console.error('Error parsing username:', error);
            return 'Unknown User';
        }
    };

    return (
        // Container chính với hiệu ứng blur và shadow
        // z-[1000] đảm bảo component hiển thị trên các phần tử khác
        // backdrop-blur-xl tạo hiệu ứng mờ cho nền
        <div className={`relative z-[1000] backdrop-blur-xl bg-opacity-80 p-6 rounded-2xl shadow-xl mb-6 transform transition-all duration-300 hover:shadow-2xl`}
            style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(255, 255, 255, 0.8)" }}
        >
            {/* Header chứa tiêu đề và các nút chức năng */}
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>User Prompts</h2>
                <div className="flex gap-2">
                    {/* Nút Select/Deselect All - Cho phép chọn hoặc bỏ chọn tất cả prompts cùng lúc */}
                    <button
                        onClick={() => {
                            console.log('Toggle all prompts button clicked. Current state:', areAllPromptsSelected());
                            toggleAllPrompts();
                        }}
                        className={`px-3 py-1.5 rounded-full ${isDarkMode
                                ? "bg-blue-700 hover:bg-blue-600"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white flex items-center gap-1 transition-all hover-scale active-scale text-sm`}
                        disabled={isSimulating}
                    >
                        {/* Icon checkmark - Biểu tượng dấu tích */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {/* Hiển thị text tương ứng với trạng thái hiện tại */}
                        {areAllPromptsSelected() ? "Deselect All" : "Select All"}
                    </button>

                    {/* Nút Add Prompt - Cho phép thêm prompt mới vào danh sách */}
                    <button
                        onClick={() => {
                            console.log('Add new prompt button clicked');
                            addNewPrompt();
                        }}
                        className={`px-4 py-2 rounded-full ${isDarkMode
                                ? "bg-green-700 hover:bg-green-600"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white flex items-center gap-2 transition-all hover-scale active-scale`}
                        disabled={isSimulating}
                    >
                        {/* Icon dấu cộng - Biểu tượng thêm mới */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Add Prompt
                    </button>
                </div>
            </div>

            {/* Grid hiển thị các avatar prompts - Sử dụng responsive grid với số cột thay đổi theo kích thước màn hình */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-4">
                {/* Lặp qua danh sách prompts, giới hạn số lượng hiển thị dựa vào showAllPrompts */}
                {/* Nếu showAllPrompts = true, hiển thị tất cả, ngược lại chỉ hiển thị 20 prompt đầu tiên */}
                {userPrompts.slice(0, showAllPrompts ? userPrompts.length : 20).map((prompt, index) => {
                    // console.log(`Rendering prompt ${index + 1} (ID: ${prompt.id}), selected: ${prompt.selected}`);
                    return (
                        <div key={prompt.id} className="relative">
                            {/* Container cho avatar và các indicator */}
                            <div className="relative">
                                {/* Nút Edit */}
                                <button 
                                    className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-1 shadow-lg border-2 border-gray-900 hover:bg-purple-600 transition-all z-10"
                                    onClick={(e) => { 
                                        e.stopPropagation();
                                        handleStartEdit(prompt.id, prompt.content);
                                    }}
                                >
                                    {/* Icon bút chì - Biểu tượng chỉnh sửa */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>

                                {/* Container avatar có thể click để chọn/bỏ chọn - Khi được chọn sẽ có viền xanh */}
                                <div
                                    onClick={() => {
                                        console.log(`Toggle selection for prompt ${prompt.id}, current state: ${prompt.selected}`);
                                        togglePromptSelection(prompt.id);
                                    }}
                                    className={`cursor-pointer group ${
                                        prompt.selected ? (isDarkMode ? "ring-2 ring-blue-500" : "ring-2 ring-blue-400") : ""
                                    } rounded-full transition-all duration-200`}
                                >
                                    {/* Hình avatar - Hiển thị hình ảnh đại diện cho prompt */}
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center hover:shadow-lg transition-all mx-auto">
                                        <img
                                            src="./images/baby.png"
                                            alt={`Prompt ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Xử lý khi ảnh lỗi, hiển thị ảnh mặc định dạng SVG
                                                console.log(`Image load error for prompt ${prompt.id}, using fallback image`);
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23aaa'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>

                                    {/* Dấu tích khi prompt được chọn - Hiển thị ở góc trên bên trái của avatar */}
                                    {prompt.selected && (
                                        <div className="absolute -top-1 -left-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg border-2 border-gray-900">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Tooltip hiển thị nội dung prompt khi hover */}
                                    <div className={`absolute invisible group-hover:visible w-80 p-3 z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 rounded-lg shadow-xl ${
                                        isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                    } text-xs border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                                        <div className="font-bold mb-1">
                                            {prompt.name} - Prompt {index + 1}
                                        </div>
                                        <div className="text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">
                                            {prompt.content || "Empty prompt"}
                                        </div>
                                    </div>

                                    {/* Form edit - chỉ hiển thị khi đang edit prompt này */}
                                    {editingId === prompt.id && (
                                        <div className={`absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 p-4 rounded-lg shadow-xl ${
                                            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                                        } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                                            {/* Thêm thông báo trạng thái */}
                                            {saveStatus && (
                                                <div className={`mb-2 px-3 py-1 rounded text-sm ${
                                                    saveStatus === 'success' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {saveStatus === 'success' ? 'Saved successfully!' : 'Error saving changes'}
                                                </div>
                                            )}
                                            
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => {
                                                    console.log('Textarea content changed:', {
                                                        newLength: e.target.value.length,
                                                        preview: e.target.value.substring(0, 50) + '...'
                                                    });
                                                    setEditContent(e.target.value);
                                                }}
                                                className={`w-full p-2 rounded ${
                                                    isDarkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-800"
                                                }`}
                                                rows={5}
                                            />
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setSaveStatus(null);
                                                    }}
                                                    className="px-3 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSavePrompt(prompt.id, editContent)}
                                                    className={`px-3 py-1 rounded text-white text-sm ${
                                                        saveStatus === 'success'
                                                            ? 'bg-green-500'
                                                            : 'bg-blue-500 hover:bg-blue-600'
                                                    }`}
                                                    disabled={saveStatus === 'success'}
                                                >
                                                    {saveStatus === 'success' ? 'Saved!' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Tên/nhãn của prompt */}
                                <div className={`text-center mt-1 text-xs truncate ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {prompt.name}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Nút "Xem thêm" hoặc "Ẩn bớt" - Chỉ hiển thị khi có nhiều hơn 20 prompts */}
            {userPrompts.length > 20 && (
                <div className="text-center mt-4 mb-4">
                    <button
                        onClick={() => {
                            console.log(`Toggle show all prompts. Current state: ${showAllPrompts}, Total prompts: ${userPrompts.length}`);
                            setShowAllPrompts(!showAllPrompts);
                        }}
                        className={`px-4 py-2 rounded-lg ${isDarkMode
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            } transition-all hover-scale active-scale`}
                    >
                        {/* Hiển thị text tương ứng với trạng thái hiện tại */}
                        {showAllPrompts ? "Ẩn bớt" : `Xem thêm (${userPrompts.length - 20})`}
                    </button>
                </div>
            )}
        </div>
    );
};

// Export component để sử dụng ở nơi khác trong ứng dụng
export default UserPrompts;