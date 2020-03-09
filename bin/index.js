"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const telegraf_1 = require("telegraf");
const user_list_1 = require("./user-list");
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
        this.bot.command("/setusername", ctx => this.setUsername(ctx));
        this.bot.command("/attivanotifiche", ctx => this.notificationToggle(ctx, true));
        this.bot.command("/disattivanotifiche", ctx => this.notificationToggle(ctx, false));
    }
    setUsername(ctx) {
        let input = ctx.message.text.split(" ");
        if (input.length < 2 || input[1].indexOf('.') < 0) {
            ctx.reply("Il messaggio deve essere nel formato\n/setusername nome.cognome");
            return;
        }
        user_list_1.default.addUser(ctx.chat.id.toString(), input[1]);
        ctx.reply("Username salvato");
    }
    notificationToggle(ctx, status) {
        if (user_list_1.default.editNotification(ctx.chat.id.toString(), status)) {
            ctx.reply("Preferenze notifiche modificate");
        }
        else {
            ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome");
        }
    }
}
const bot = new Bot();
