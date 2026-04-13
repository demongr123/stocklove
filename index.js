const { Client, GatewayIntentBits, EmbedBuilder, Events, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

const { TOKEN, SELLAUTH_API_KEY, CHANNEL_ID, MESSAGE_ID } = process.env;
const SHOP_ID = "222906", CLIENT_ID = "1342416194759659551";
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

async function getProducts() {
    try {
        const res = await axios.get(`https://api.sellauth.com/v1/shops/${SHOP_ID}/products`, {
            headers: { 'Authorization': `Bearer ${SELLAUTH_API_KEY}`, 'Accept': 'application/json' }
        });
        return res.data.data;
    } catch (e) { return null; }
}

function getPr(o) { return parseFloat((o.price?.amount || o.price?.value || o.unit_price || o.price || 0)).toFixed(2); }

async function createEmbed() {
    const prods = await getProducts();
    if (!prods) return null;
    let inS = "", outS = "";
    prods.forEach(p => {
        let txt = "";
        if (p.variants?.length > 1) {
            txt += `+ ${p.name.toUpperCase()}\n`;
            p.variants.forEach(v => txt += `  ${parseInt(v.stock||0)<=0?'×':'›'} ${v.name}: ${parseInt(v.stock||0)<=0?'OUT':v.stock+' pcs'} [${getPr(v)}€]\n`);
        } else {
            const s = p.stock ?? p.variants?.[0]?.stock ?? 0;
            txt += `${parseInt(s)<=0?'×':'›'} ${p.name} - ${parseInt(s)<=0?'OUT':s+' pcs'} [${getPr(p)}€]\n`;
        }
        const total = p.stock ?? p.variants?.reduce((a,v)=>a+(v.stock||0), 0) ?? 0;
        if (parseInt(total) > 0) inS += txt; else outS += txt;
    });
    const em = new EmbedBuilder().setTitle('🛒 Niro Market | Stock').setColor('#1c7b5d')
        .addFields({name:'✅ Available Items', value:`\`\`\`diff\n${inS||'None'}\n\`\`\``}, {name:'❌ Out of Stock', value:`\`\`\`diff\n${outS||'None'}\n\`\`\``}).setTimestamp();
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Buy Now').setURL('https://niro-market.mysellauth.com').setStyle(ButtonStyle.Link));
    return { embeds: [em], components: [row] };
}

client.on(Events.InteractionCreate, async i => {
    if (!i.isChatInputCommand() || i.commandName !== 'showlivestock') return;
    await i.deferReply({ flags: [64] });
    const data = await createEmbed();
    if (!data) return i.editReply("API Error");
    const msg = await i.channel.send(data);
    i.editReply(`✅ Created! ID: \`${msg.id}\``);
});

client.once(Events.ClientReady, c => {
    console.log(`🚀 Online: ${c.user.tag}`);
    setInterval(async () => {
        if (!MESSAGE_ID || !CHANNEL_ID) return;
        try {
            const ch = await c.channels.fetch(CHANNEL_ID);
            const msg = await ch.messages.fetch(MESSAGE_ID);
            const data = await createEmbed();
            if (data) await msg.edit(data);
            console.log("🔄 Updated");
        } catch (e) { console.log("Update Error"); }
    }, 60000);
});

client.login(TOKEN);
