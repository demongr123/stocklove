const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Διαβάζει από το Railway
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
    new SlashCommandBuilder()
        .setName('showlivestock')
        .setDescription('Εμφανίζει το Live Stock Dashboard'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        if (!TOKEN || !CLIENT_ID) {
            console.error("❌ Λείπει το TOKEN ή το CLIENT_ID από τα Variables!");
            return;
        }
        console.log('🔄 Ξεκινάει η καταχώρηση των commands...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('✅ Οι εντολές καταχωρήθηκαν επιτυχώς!');
    } catch (error) {
        console.error(error);
    }
})();
