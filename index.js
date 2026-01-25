const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const http = require('http');

// نظام الحفاظ على النشاط (لربطه مع UptimeRobot)
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

// إعدادات البوت
const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461512665087344838'; // الأيدي اللي أرسلته

async function connectToVoice(channel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });

        console.log(`⏳ محاولة دخول الروم: ${channel.name}`);

        // التعامل مع حالات الانقطاع
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (e) {
                console.log("⚠️ تم قطع الاتصال، جاري العودة...");
                connection.destroy();
                connectToVoice(channel);
            }
        });

        // حل مشكلة Socket و Encryption
        connection.on('error', error => {
            console.error("❌ خطأ في الصوت:", error);
            if (error.message.includes('socket closed') || error.message.includes('encryption')) {
                connection.destroy();
                connectToVoice(channel);
            }
        });

    } catch (error) {
        console.error("❌ فشل الاتصال:", error);
    }
}

client.on('ready', () => {
    console.log(`✅ متصل الآن باسم: ${client.user.tag}`);
    const channel = client.channels.cache.get(VOICE_ID);
    if (channel) {
        connectToVoice(channel);
    } else {
        console.log("❌ لم أجد الروم! تأكد أن البوت داخل السيرفر.");
    }
});

client.login(TOKEN);
