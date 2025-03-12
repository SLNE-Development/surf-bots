import cluster from "cluster";
import { createBot } from "mineflayer";
import { BotHolder } from "./bot/bot-holder";

require("dotenv").config();

const botAmount = 100;
const botsPerProcess = 50;

const serverIp = process.env.SERVER_IP;
const serverPort = process.env.SERVER_PORT;
const sessionServer = process.env.SESSION_SERVER;

const startBots = (startIndex: number, endIndex: number) => {
	const botHolder = new BotHolder();

	for (let i = startIndex; i < endIndex; i++) {
		const botName = `Bot_${i}`;

		const bot = createBot({
			host: serverIp,
			port: parseInt(serverPort),
			username: botName,
			password: "password",
			version: "1.21.4",
			auth: "offline",
			sessionServer: sessionServer,
		});

		botHolder.addBot(bot);
	}

	botHolder.setupBots((bot) => {
		bot.on("kicked", (reason) => {
			console.log(`Bot ${bot.username} was kicked for ${reason}`);
		});

		bot.on("error", (error) => {
			console.log(`Bot ${bot.username} encountered an error: ${error}`);
		});

		bot.on("end", () => {
			console.log(`Bot ${bot.username} disconnected`);
		});

		bot.once("spawn", () => {
			console.log(`Bot ${bot.username} spawned`);
			bot.chat("Hello, world!");
		});

		bot.on("chat", (username, message) => {
			if (username === bot.username) return;

			switch (message) {
				case "swing":
					bot.swingArm("right");
					break;
				case "jump":
					bot.setControlState("jump", true);
					setTimeout(() => bot.setControlState("jump", false), 500);
					break;
				case "attack":
					const entity = bot.nearestEntity();
					if (entity) bot.attack(entity);
					break;
			}
		});
	});
};

if (cluster.isPrimary) {
	// Master process
	const processCount = Math.ceil(botAmount / botsPerProcess);

	for (let i = 0; i < processCount; i++) {
		const startIndex = i * botsPerProcess;
		const endIndex = Math.min((i + 1) * botsPerProcess, botAmount);

		const worker = cluster.fork();
		worker.send({ startIndex, endIndex }); // Send range of bots to each worker

		worker.on("exit", (code) => {
			console.log(`Worker ${worker.id} exited with code ${code}`);
		});
	}

	cluster.on("exit", (worker, code, signal) => {
		console.log(`Worker ${worker.id} died with code: ${code}`);
	});
} else {
	// Worker process
	process.on("message", (message: any) => {
		const { startIndex, endIndex } = message;

		startBots(startIndex, endIndex);
	});
}
