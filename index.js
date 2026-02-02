const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const http = require('http');

http.createServer((req, res) => { res.write("Bot is Live"); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages]
});

// يقرأ التوكن من إعدادات ريندر
const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461511107348004898'; 

client.on('ready', () => {
    console.log(`✅ البوت صار اونلاين باسم: ${client.user.tag}`);
    const channel = client.channels.cache.get(VOICE_ID);
    if (channel) {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }
});

client.login(TOKEN).catch(err => console.log("❌ مشكلة في التوكن: " + err.message));
