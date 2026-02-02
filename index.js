const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const http = require('http');

// سيرفر وهمي عشان ريندر ما يطفي البوت
http.createServer((req, res) => {
  res.write("I am Alive");
  res.end();
}).listen(process.env.PORT || 8080);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const TOKEN = process.env.TOKEN; 
const VOICE_ID = '1461512665087344838'; // ايدي الروم اللي أرسلته

client.on('ready', () => {
    console.log(`✅ البوت دخل الخدمة باسم: ${client.user.tag}`);
    const channel = client.channels.cache.get(VOICE_ID);
    if (channel) {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: true
        });
        console.log("🔊 البوت مفروض يكون بالروم الحين");
    } else {
        console.log("❌ لم أجد الروم، تأكد من وجود البوت بالسيرفر");
    }
});

client.login(TOKEN).catch(err => console.log("❌ التوكن غلط أو محروق: " + err.message));
