"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const telegraf_1 = require("telegraf");
class Bot {
    constructor() {
        this.bot = new telegraf_1.default(process.env.BOT_TOKEN);
        this.middleware();
        this.bot.launch();
    }
    middleware() {
        this.bot.start(ctx => ctx.reply("Hello There"));
        this.bot.help(ctx => ctx.reply("Help me"));
        this.bot.command("/ping", ctx => ctx.reply("pong!"));
    }
}
const bot = new Bot();
