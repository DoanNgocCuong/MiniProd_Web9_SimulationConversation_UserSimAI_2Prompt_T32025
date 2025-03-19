export const generateMockData = (selectedPrompts) => {
    return selectedPrompts.map(prompt => {
        const contentLines = prompt.content.split('\n');
        const nameLine = contentLines.find(line => line.trim().startsWith('User:'));
        const ageLine = contentLines.find(line => line.trim().startsWith('Age & Level:'));
        const personalityLine = contentLines.find(line => line.trim().startsWith('Personality:'));

        const userName = nameLine ? nameLine.replace('User:', '').trim() : 'Unknown User';
        const ageMatch = ageLine ? ageLine.match(/(\d+)\s+years/) : null;
        const age = ageMatch ? parseInt(ageMatch[1]) : 5;

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

        const now = new Date();
        let messages = [];

        if (isStubborn) {
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

        messages.forEach((msg, index) => {
            const randomOffset = Math.floor(Math.random() * 5000);
            const baseTime = now.getTime() - ((6 - index) * 10000) - randomOffset;
            msg.timestamp = new Date(baseTime).toISOString();
        });

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