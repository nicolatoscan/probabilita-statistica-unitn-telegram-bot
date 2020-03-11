import * as dotenv from 'dotenv';
import Telegram, { ContextMessageUpdate } from "telegraf"
import userList from './user-list';
import notificationManager from './notification-manager';
import votiManager from './voti-manager';
dotenv.config();

class Bot {
    private bot: Telegram<ContextMessageUpdate>;

    private helpMessage: string = "Con questo bot potrai ricevere i voti degli esercizi di Proabilità e statistica con /voti o /ultimovoto,\n\n" +
        "Ricordati di impostare il tuo username con\n/setusername nome.cognome\n" +
        "(la matricola non è necessaria)\n\n" +
        "Se vuoi puoi ricevere automaticamente il nuovo voto a mezzanotte attivando le notifiche con /attivanotifiche\n\n" + 
        "Se il bot non funziona come dovrebbe o hai dei seggerimenti, contattami a @nicolatoscan";

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

        this.bot.on('message', ctx => { ctx.reply("Comando non trovato, puoi utilizare /help per aiuto")})
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
        let msg = ctx.reply("Loading ...");
        ctx.telegram.editMessageText(ctx.chat.id, (await msg).message_id, null, await votiManager.getVotiMsg(username))
    }

    private async ultimoVoto(ctx: ContextMessageUpdate) {
        let username = userList.getUserByChatId(ctx.chat.id.toString());
        let msg = ctx.reply("Loading ...");
        ctx.telegram.editMessageText(ctx.chat.id, (await msg).message_id, null, await votiManager.getVotiMsg(username, true))
    }

}

const bot = new Bot();