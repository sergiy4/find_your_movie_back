import getChatConfig from '../../config/chatConfig.js';

async function getChatAnswer(description, openai) {
  const chatResponse = await openai.chat.completions.create(
    getChatConfig(description)
  );

  return JSON.parse(chatResponse.choices[0].message.content);
}

export default getChatAnswer;
