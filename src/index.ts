import * as dotenv from 'dotenv';
dotenv.config();

import Telegram, { ContextMessageUpdate } from "telegraf"


class Bot {
    private bot: Telegram<ContextMessageUpdate>;

    constructor() {
        this.bot = new Telegram(process.env.BOT_TOKEN)
        this.middleware()
        this.bot.launch()

    }

    private middleware(): void {
        this.bot.start(ctx => ctx.reply("Hello There"))
        this.bot.help(ctx => ctx.reply("Help me"))
        this.bot.command("/ping", ctx => ctx.reply("pong!"))
    }

}

const bot = new Bot();