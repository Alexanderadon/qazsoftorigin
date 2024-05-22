const axios = require('axios');
const { generateToken } = require('./tokenUtils');
//создаем ссылки

async function createChatAndInviteLink(botToken, chatId) {
  try {
    const expireDate = Math.floor(Date.now() / 1000) + (60 * 60);

    const response = await axios.post(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      chat_id: chatId,
      expire_date: expireDate,
      creates_join_request: true
    });

    if (!response.data.ok) {
      throw new Error('Failed to create invite link.');
    }

    return response.data.result.invite_link;
  } catch (error) {
    console.error('Error creating invite link:', error);
    throw error;
  }
}

module.exports = {
  createChatAndInviteLink
};