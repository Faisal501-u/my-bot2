const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const http = require('http');

// نظام الحفاظ على النشاط لـ UptimeRobot
http.createServer((req, res) => {
  res.write("Bot is Alive!");
  res.end();
}).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

// قراءة التوكن من إعدادات Render (لحماية البوت من التعطيل)
const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461515866041487575'; 

async function connectToVoice(channel) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false,
        });

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (e) {
                console.log("⚠️ إعادة اتصال تلقائي...");
                connection.destroy();
                connectToVoice(channel);
            }
        });
    } catch (error) {
        console.error("Voice Error:", error);
    }
}

client.on('ready', () => {
    console.log(`✅ ${client.user.tag} is Online!`);
    const channel = client.channels.cache.get(VOICE_ID);
    if (channel) connectToVoice(channel);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!تقديم') {
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'إدارة 73™', iconURL: client.user.displayAvatarURL() })
            .setTitle('تعلن إدارة 73™ عن فتح باب التقديم برتبة STAFF')
            .setDescription(`\n📌 **القسم** : [📝] **الأسئلة** :\n\nقم بالضغط على الزر أدناه للبدء.`)
            .setColor('#2b2d31');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply_staff')
                .setLabel('تقديم')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Primary)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});

client.login(TOKEN);
