import * as dotenv from 'dotenv';
import Telegram, { ContextMessageUpdate } from "telegraf"
import TelegrafInlineMenu from "telegraf-inline-menu"
import userList from './user-list';
import votiManager from './voti-manager';
import { ContextNextFunc } from 'telegraf-inline-menu/dist/source/generic-types';
import notificationManager from './notification-manager';
dotenv.config();

class Bot {
    private bot: Telegram<ContextMessageUpdate>;

    private helpMessage: string = "Imposta il tuo username con /setusername nome.cognome e potrai vedere i tuoi voti con /voti o /ultimovoto\n\n" +
        "Puoi ricevere automaticamente il voto a mezzanotte o un promemoria alle 23 attivando le /notifiche\n\n" +
        "Se il bot non funziona come dovrebbe o hai dei suggerimenti, contattami a @nicolatoscan"

    constructor() {
        this.bot = new Telegram(process.env.BOT_TOKEN)
        this.middleware()
        this.bot.launch()

        notificationManager.start()

        console.log("Bot started");
    }

    private middleware(): void {
        this.bot.start(ctx => ctx.reply(this.helpMessage))
        this.bot.help(ctx => ctx.reply(this.helpMessage))

        this.bot.use(this.setMenuNotifiche())

        this.bot.command("/setusername", ctx => this.setUsername(ctx))
        this.bot.command("/voti", ctx => this.voti(ctx))
        this.bot.command("/ultimovoto", ctx => this.ultimoVoto(ctx))
        this.bot.command("/stalker", ctx => this.stalker(ctx))
        this.bot.command("/dimenticami", ctx => this.dimenticami(ctx))

        this.bot.command("/ping", ctx => ctx.reply("pong!"))
        this.bot.command("/cleancache", () => votiManager.cleanCache())

        this.bot.on('message', ctx => { ctx.reply("Comando non trovato, puoi utilizare /help per aiuto") })
    }


    private setUsername(ctx: ContextMessageUpdate): void {
        let input = ctx.message.text.split(" ");
        if (input.length < 2 || input[1].indexOf('.') < 0) {
            try {
                ctx.reply("Il messaggio deve essere nel formato\n/setusername nome.cognome")
            } catch (error) { }
            return;
        }

        userList.addUser(ctx.chat.id.toString(), input[1]);
        try {
            ctx.reply("Username salvato")
        } catch (error) { }


    }

    private setMenuNotifiche(): ContextNextFunc {

        const notificationMenu = new TelegrafInlineMenu('Scegli la tipologia');
        notificationMenu.toggle("Voto", "voto", {
            setFunc: ((ctx, newState) => { userList.editNotificationVoti(ctx.chat.id.toString(), newState) }),
            isSetFunc: ((ctx) => userList.getNotificationVoti(ctx.chat.id.toString())),
        })

        notificationMenu.toggle("Promemoria", "promemoria", {
            setFunc: ((ctx, newState) => { userList.editNotificationRemember(ctx.chat.id.toString(), newState) }),
            isSetFunc: ((ctx) => userList.getNotificationRemember(ctx.chat.id.toString())),
        })

        notificationMenu.setCommand("notifiche")
        return notificationMenu.init();
    }

    private async voti(ctx: ContextMessageUpdate) {
        let username = userList.getUserByChatId(ctx.chat.id.toString());
        try {
            let msg = ctx.reply("Loading ...");
            ctx.telegram.editMessageText(ctx.chat.id, (await msg).message_id, null, await votiManager.getVotiMsg(username))
        } catch (error) {
        }
    }

    private async ultimoVoto(ctx: ContextMessageUpdate) {
        let username = userList.getUserByChatId(ctx.chat.id.toString());
        try {
            let msg = ctx.reply("Loading ...");
            ctx.telegram.editMessageText(ctx.chat.id, (await msg).message_id, null, await votiManager.getVotiMsg(username, true))
        } catch (error) {
        }
    }

    private async stalker(ctx: ContextMessageUpdate) {
        let input = ctx.message.text.split(" ");
        if (input.length < 2 || !input[1] || input[1].indexOf('.') < 0) {
            try {
                ctx.reply("Il messaggio deve essere nel formato\n/stalker nome.cognome")
            } catch (error) {
            }
            return;
        }

        try {
            let msg = ctx.reply("Loading ...");
            ctx.telegram.editMessageText(ctx.chat.id, (await msg).message_id, null, await votiManager.getVotiMsg(input[1].toLowerCase()))
        } catch (error) {
        }
    }

    private async dimenticami(ctx: ContextMessageUpdate) {
        userList.removeUsername(ctx.chat.id.toString())
        try {
            ctx.reply("I tuoi dati sono stati rimossi");
        } catch (error) {
        }
    }


    public sendMessage(chatId: string, text: string) {
        try {
            this.bot.telegram.sendMessage(chatId, text);
        } catch (err) {
            console.log(err);
        }
    }



}

const bot = new Bot();
export default bot;