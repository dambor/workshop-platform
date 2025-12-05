import { chatConfig } from '../src/config/chatConfig';

export const sendMessageToLangflow = async (inputValue: string, sessionId: string) => {
    const token = import.meta.env.VITE_ASTRA_TOKEN;
    if (!token) {
        throw new Error('VITE_ASTRA_TOKEN is not defined');
    }

    const payload = {
        "output_type": "chat",
        "input_type": "chat",
        "input_value": inputValue,
        "session_id": sessionId
    };

    const url = `${chatConfig.apiUrl}/lf/${chatConfig.langflowId}/api/v1/run/${chatConfig.flowId}`;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-DataStax-Current-Org': chatConfig.orgId,
            'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
        },
        body: JSON.stringify(payload)
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Extract the message from the response structure
        // The structure is typically outputs[0].outputs[0].results.message.text
        // But we should be robust
        const outputMessage = data.outputs?.[0]?.outputs?.[0]?.results?.message?.text || "I received your message but couldn't parse the response.";
        return outputMessage;
    } catch (error) {
        console.error('Error sending message to Langflow:', error);
        throw error;
    }
};
