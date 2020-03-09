import * as dotenv from 'dotenv';
dotenv.config();

import Telegram, { ContextMessageUpdate } from "telegraf"
import userList from './user-list';
import notificationManager from './notification-manager';
import votiManager, { Voto } from './voti-manager';


class Bot {
    private bot: Telegram<ContextMessageUpdate>;

    private helpMessage: string = "Con questo bot potrai ricevere i voti degli esercizi di Proabilità e statistica con /voti o /ultimovoto,\n" +
        "Ricordati di impostare il tuo username con\n/setusername nome.cognome\n" +
        "(la matricola non è necessaria)\n" +
        "Se vuoi puoi ricevere automaticamente il nuovo voto a mezzanotte attivando le notifiche con /attivanotifiche"

    constructor() {
        this.bot = new Telegram(process.env.BOT_TOKEN)
        this.middleware()
        this.bot.launch()

        notificationManager.set(this.bot);
    }

    private middleware(): void {
        this.bot.start(ctx => ctx.reply(this.helpMessage))
        this.bot.help(ctx => ctx.reply(this.helpMessage))
        this.bot.command("/ping", ctx => ctx.reply("pong!"))

        this.bot.command("/setusername", ctx => this.setUsername(ctx))
        this.bot.command("/attivanotifiche", ctx => this.notificationToggle(ctx, true))
        this.bot.command("/disattivanotifiche", ctx => this.notificationToggle(ctx, false))

        this.bot.command("/voti", ctx => this.voti(ctx))
        this.bot.command("/ultimovoto", ctx => this.ultimoVoto(ctx))
    }


    private setUsername(ctx: ContextMessageUpdate): void {
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

    private async voti(ctx: ContextMessageUpdate) {
        let username = userList.getUserByChatId(ctx.chat.id.toString());
        if (username == null) {
            ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome")
            return
        }
        let voti = await votiManager.getVoti(username);

        if (!voti) {
            ctx.reply("Impossibile trovare i voti")
            return;
        }

        let res = `Voti di: ${username}\n\nMedia: ${voti.avg}\n`;
        res += voti.voti.map(v => `${v.date}: ${v.value}`).join("\n")
        ctx.reply(res);
    }


    private async ultimoVoto(ctx: ContextMessageUpdate) {
        let username = userList.getUserByChatId(ctx.chat.id.toString());
        if (username == null) {
            ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome")
            return
        }
        let voti = await votiManager.getVoti(username);

        if (!voti) {
            ctx.reply("Impossibile trovare i voti")
            return;
        }

        let res = `Ultimo voto di: ${username}\n\n`;
        res += `${voti.voti[0].date}: ${voti.voti[0].value}`
        res += `Media: ${voti.avg}`
        ctx.reply(res);
    }

}

const bot = new Bot();