export const genFeedback = async (conversation, dod) => {
    try {
        // Format conversation into a single string
        // Each message should be in format: "User/Bot: message"
        const formattedConversation = conversation.messages
            .map(msg => `${msg.role === 'user' ? 'User' : 'Pika'}: ${msg.content}`)
            .join('\n');

        // Add user info at the start of conversation if available
        // const fullConversation = formattedConversation;

        // Log inputs
        console.log('=== genFeedback Inputs ===');
        console.log('Conversation:', {
            userInfo: conversation.userInfo,
            messages: conversation.messages,
            formattedConversation: formattedConversation
        });
        console.log('DoD:', dod);
        console.log('=== End Inputs ===');

        const response = await fetch('http://localhost:25050/check-dod-gen-feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: {
                    conversation: formattedConversation,
                    DoD: dod // DoD from AgentMode component
                },
                response_mode: 'blocking',
                user: 'abc-123'
            })
        });

        const data = await response.json();
        
        // Log API response
        console.log('=== API Response ===');
        console.log('Status:', data.status);
        console.log('Content:', data.content);
        console.log('=== End Response ===');

        if (data.status === 200 && data.content?.data?.outputs?.output) {
            const feedback = JSON.parse(data.content.data.outputs.output);
            return {
                status: feedback.status,
                explanation: feedback.explain,
                score: feedback.status === 'pass' ? 100 : 0
            };
        }

        throw new Error('Invalid response format');

    } catch (error) {
        console.error('Error generating feedback:', error);
        return {
            status: 'fail',
            explanation: 'Failed to generate feedback. Please try again.',
            score: 0
        };
    }
};
