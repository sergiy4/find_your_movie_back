import getChatSystemMessage from '../src/lib/getChatSystemMessage.js';

export default function getChatConfig(description) {
  return {
    messages: [
      {
        role: 'system',
        content: getChatSystemMessage(),
      },
      {
        role: 'user',
        content: ` Description of the movie I want:"""${description}"""`,
      },
    ],
    model: 'gpt-3.5-turbo-16k-0613',
    frequency_penalty: 1.5,
    temperature: 1,
    max_tokens: 100,
  };
}
