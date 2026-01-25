const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const http = require('http');

// نظام الحفاظ على النشاط (لازم للربط مع UptimeRobot)
http.createServer((req, res) => {
  res.write("Bot is Alive!");
  res.end();
}).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// --- ضع بيانات البوت هنا ---
const TOKEN = process.env.TOKEN; // الأفضل تحطه في Environment في Render
const VOICE_ID = '1461515866041487575'; // ايدي الروم الصوتي

async function connectToVoice(channel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true, // يخلي البوت أصم (يخفف لاق)
            selfMute: false,
        });

        // ميزة إعادة الاتصال التلقائي إذا فصل
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (e) {
                console.log("⚠️ البوت فصل.. جاري إعادة الدخول...");
                connection.destroy();
                connectToVoice(channel);
            }
        });

        connection.on('error', error => {
            console.error("Voice Error:", error);
            if (error.message.includes('socket closed')) {
                connectToVoice(channel);
            }
        });
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

client.on('ready', () => {
    console.log(`✅ البوت شغال باسم: ${client.user.tag}`);
    const channel = client.channels.cache.get(VOICE_ID);
    if (channel) connectToVoice(channel);
});

client.login(TOKEN);
