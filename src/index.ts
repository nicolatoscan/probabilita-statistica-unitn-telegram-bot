import * as dotenv from 'dotenv';
dotenv.config();

import Telegram, { ContextMessageUpdate } from "telegraf"
import userList from './user-list';


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

        this.bot.command("/setusername", ctx => this.setUsername(ctx))
        this.bot.command("/attivanotifiche", ctx => this.notificationToggle(ctx, true))
        this.bot.command("/disattivanotifiche", ctx => this.notificationToggle(ctx, false))
    }


    private setUsername(ctx: ContextMessageUpdate) : void {
        let input = ctx.message.text.split(" ");
        if (input.length < 2 || input[1].indexOf('.') < 0) {
            ctx.reply("Il messaggio deve essere nel formato\n/setusername nome.cognome")
            return;
        }

        userList.addUser(ctx.chat.id.toString(), input[1]);
        ctx.reply("Username salvato")
    }

    private notificationToggle(ctx: ContextMessageUpdate, status: boolean) {
        if (userList.editNotification(ctx.chat.id.toString(), status)) {
            ctx.reply("Preferenze notifiche modificate")
        } else {
            ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome")
        }
    }

}

const bot = new Bot();