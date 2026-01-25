const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const http = require('http');

// الحفاظ على نشاط البوت 24/7
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

// --- البيانات الخاصة بك ---
const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461512665087344838'; // الأيدي الجديد اللي أرسلته

async function connectToVoice(channel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });

        console.log(`📡 جاري محاولة الاتصال بـ: ${channel.name}`);

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                // محاولة إعادة الاتصال التلقائي خلال 5 ثوانٍ
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (e) {
                console.log("⚠️ فصل البوت، جاري العودة للروم...");
                connection.destroy();
                connectToVoice(channel);
            }
        });

    } catch (error) {
        console.error("❌ فشل الدخول للروم:", error);
    }
}

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} متصل الآن!`);
    const channel = client.channels.cache.get(VOICE_ID);
    
    if (channel) {
        connectToVoice(channel);
    } else {
        console.log("❌ لم أستطع العثور على الروم، تأكد من أن البوت موجود في السيرفر!");
    }
});

client.login(TOKEN);
