import { Bot } from "mineflayer";

export class BotHolder {
	private bots: Bot[] = [];

	/**
	 * Sets up each bot in the bot holder
	 *
	 * @param func the setup function which is being executed for each bot
	 */
	public setupBots(func: (bot: Bot) => void) {
		this.bots.forEach(func);
	}

	/**
	 * Executes a function for each bot in the bot holder
	 *
	 * @param func the function which is being executed for each bot
	 */
	public executeAndForget(func: (bot: Bot) => void) {
		this.bots.forEach(func);
	}

	/**
	 * Executes a function for each bot in the bot holder
	 *
	 * @param func the function which is being executed for each bot
	 * @returns an array of the results of the function for each bot
	 */
	public execute<T>(func: (bot: Bot) => Promise<T>): Promise<T[]> {
		return Promise.all(this.bots.map(func));
	}

	public addBot(bot: Bot) {
		this.bots.push(bot);
	}

	public getBots() {
		return [...this.bots];
	}
}
