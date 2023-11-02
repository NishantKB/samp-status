const express = require("express")
const app = express()
app.get("/", (req, res) => {
    res.send("Hello world!")
})
app.listen(3000, () => {
    console.log("Bot is online!")
})
const Discord = require('discord.js');
const gamedig = require('gamedig');
const website = "www."; //add your website inside the ""
const client = new Discord.Client();
const mysql = require('mysql2/promise');
const PREFIX = '!'; // the prefix of bot is ! you can change it here!

const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    Client,
    Intents,
    MessageEmbed
} = require('discord.js');

client.on('ready', () => {
    setInterval(() => {
        gamedig.query({
            type: 'samp',
            host: '127.0.0.1', // add your samp server ip inside ''
            port: 7777 // replace 7777 with your server pot
        }).then((state) => {
            // Set the bot's activity based on the server status
            client.user.setActivity(`on ${state.name} (${state.players.length} players online!)  | ${website}`, {
                type: 'PLAYING'
            });
            console.log(`Bot status set to "Playing on ${state.name} (${state.players.length} players)"`);
            console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);

        }).catch((error) => {
            client.user.setActivity(`YOUR SERVER NAME (OFFLINE)  | ${website}`, {
                type: 'PLAYING'
            }); // change YOUR SERVER NAME
            console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
            console.log('Server is offline.');
            console.error(error);
        });
    }, 60000);

});
client.on("message", (message) => {
    if (message.content === "${PREFIX}players") {
        if (
            message.channel.type === "dm" ||
            message.channel.id === "channel id" //replace channel id with the channel id where you want the bot to respond
            // add ||message.channel.id === "channel id" to add more channels
        ) {

            gamedig.query({
                type: 'samp',
                host: '127.0.0.1', // add your samp server ip inside ''
                port: 7777 // replace 7777 with your server pot
            }).then((state) => {
                let players = state.players;
                let playerList = "";
                if (players.length === 0) { //checks if there are players in the server
                    playerList = "No players currently online";
                } else {
                    for (let i = 0; i < players.length; i++) {
                        playerList += `${i+1}. ${players[i].name} - Ping: ${players[i].ping} - Level: ${players[i].score}\n`;
                    }
                }
                const embed = new Discord.MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle(`Your Server Name - Total Players: ${state.players.length}`)
                    .setDescription(playerList)
                    .setFooter('Your Server Name', 'https://imgur.com/a/aRj8eq') //replace https://imgur.com/a/aRj8eq with your server icon url
                    .setTimestamp()
                    .setTimestamp();
                message.channel.send(embed);
            }).catch((error) => {
                console.error(error);
                message.channel.send("Server is offline");
            });
        } else {
            message.reply(
                "You can use this command only in <#channelid> channel."
            );
        }
    }
});

client.on("message", async (message) => {
    // Listen for messages starting with !profile
    if (message.content.startsWith("${PREFIX}profile")) {
        if (
            message.channel.type === "dm" ||
            message.channel.id === "channel id" //replace channel id with the channel id where you want the bot to respond
            // add ||message.channel.id === "channel id" to add more channels
        ) {
            // Extract the player name from the message content
            const playerName = message.content.slice(9);

            // Ensure that the player name is not empty
            if (!playerName) {
                return message.reply("Please specify a player name!");
            }

            // Connect to the database
            const connection = await mysql.createConnection({
                host: '', // add database host inside ''
                user: '', // add database user name inside ''
                password: '', // add database password inside ''
                database: '', // add database name inside ''
            });

            try {
                // Retrieve the stats for the player from the database
                // IMPORTANT: Verify that the database query is correctly selecting the player data
                const [rows, fields] = await connection.execute('SELECT * FROM users WHERE username = ?', [playerName]);
                if (rows.length === 0) {
                    return message.channel.send(`Player ${playerName} not found!`);
                }
                if (rows.length === 0) {
                    return message.channel.send(`Player ${playerName} not found!`);
                }
                // Create an embed with the player's stats
                const embed = new MessageEmbed()
                    .setColor("RANDOM")
                    .setFooter("Your Server Name", "https://imgur.com/a/aRj8eq") //replace https://imgur.com/a/aRj8eq with your server icon url
                    .setTimestamp()
                    .setTitle(`Stats for ${rows[0].username}`) // Make sure to verify data in rows[0] before using it, as it may vary across different databases
                    .addField("Level", rows[0].level, true)
                    .addField("Total Wealth", Number(rows[0].cash) + Number(rows[0].bank), true)
                    .addField("Skin", rows[0].skin, true)
                    .addField("Health", rows[0].health, true)
                    .addField("Armor", rows[0].armor, true)
                    .addField("Phone", rows[0].phone, true)
                    .addField("Last Login", rows[0].lastlogin, true)
                    .addField("EXP", rows[0].exp, true)
                    .addField("Hours", rows[0].hours, true);

                // Send the embed as a reply to the message
                message.channel.send(embed);
            } catch (error) {
                console.error(error);
                message.reply(`Could not get stats for ${playerName}!`);
            } finally {
                // Close the database connection
                connection.end();
            }
        } else {
            message.reply(
                "You can use this command only in <#channelid> channel."
            );
        }
    }
});
// Login
client.login("YOUR_BOT_TOKEN"); // Replace with your actual bot token