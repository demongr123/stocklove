require('dotenv').config();

module.exports = {
    token: process.env.TOKEN, // Εδώ είχες DISCORD_TOKEN, άλλαξέ το σε TOKEN
    sellauthKey: process.env.SELLAUTH_API_KEY,
    channelId: process.env.CHANNEL_ID,
    messageId: process.env.MESSAGE_ID || null,
    refreshRate: 60000 
};
