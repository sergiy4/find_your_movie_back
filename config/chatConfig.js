import getChatSystemMessage from "../lib/getChatSystemMessage.js";

export default function getChatConfig(description) {
    return {
        messages: [
            {
                role: "system",
                content: getChatSystemMessage(),
            },
            {
                role: "user",
                content: `Here is the description :"""${description}"""`,
            },
        ],
        model: "gpt-3.5-turbo-16k-0613",
        frequency_penalty: 1,
        temperature: 0.8,
        max_tokens: 40,
    };
}
