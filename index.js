const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const http = require('http');

http.createServer((req, res) => { res.write("Bot is Alive!"); res.end(); }).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461512665087344838'; // تأكد أن هذا الإيدي صحيح 100%

client.on('ready', () => {
    console.log(`✅ البوت شغال: ${client.user.tag}`);
    const channel = client.channels.cache.get(VOICE_ID);
    
    if (!channel) {
        console.log("❌ خطأ: لم أستطع العثور على الروم! تأكد من الإيدي.");
    } else {
        console.log(`⏳ محاولة الدخول إلى الروم: ${channel.name}`);
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }
});

client.login(TOKEN);
