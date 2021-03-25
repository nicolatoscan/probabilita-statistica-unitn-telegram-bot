import * as dotenv from 'dotenv';
import { Telegraf, Context } from "telegraf"
import { Message } from 'telegraf/typings/telegram-types';
import TelegrafInlineMenu from "telegraf-inline-menu"
import { ContextNextFunc } from 'telegraf-inline-menu/dist/source/generic-types';
import userList from './user-list';
import votiManager from './voti-manager';
import notificationManager from './notification-manager';
dotenv.config();

class Bot {
    private bot: Telegraf<Context>;

    private helpMessage: string = "Imposta il tuo username con /setusername nome.cognome e potrai vedere i tuoi voti con /voti o /ultimovoto\n\n" +
        "Puoi ricevere automaticamente il voto a mezzanotte o un promemoria alle 23 attivando le /notifiche\n\n" +
        "Se il bot non funziona come dovrebbe o hai dei suggerimenti, contattami a @nicolatoscan"

    constructor() {
        this.bot = new Telegraf(process.env.BOT_TOKEN ?? "")
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
        this.bot.command("/ultimovoto", ctx => this.voti(ctx, true))
        this.bot.command("/stalker", ctx => this.stalker(ctx))
        this.bot.command("/dimenticami", ctx => this.dimenticami(ctx))

        this.bot.command("/ping", ctx => this.sendReply(ctx, "pong"))
        this.bot.command("/cleancache", () => votiManager.cleanCache())

        this.bot.on('message', ctx => { this.sendReply(ctx, "Comando non trovato, puoi utilizare /help per aiuto") })
    }


    private setUsername(ctx: Context): void {
        const input = ctx.message?.text?.split(" ");
        if (!input || input.length < 2 || input[1].indexOf('.') < 0) {
            this.sendReply(ctx, "Il messaggio deve essere nel formato\n/setusername nome.cognome")
            return;
        }

        if (ctx.chat) {
            userList.addUser(ctx.chat.id.toString(), input[1]);
            this.sendReply(ctx, "Username salvato")
        }
    }

    private setMenuNotifiche(): ContextNextFunc {

        const notificationMenu = new TelegrafInlineMenu('Scegli la tipologia');
        notificationMenu.toggle("Voto", "voto", {
            setFunc: ((ctx, newState) => { userList.editNotificationVoti(ctx.chat?.id.toString(), newState) }),
            isSetFunc: ((ctx) => userList.getNotificationVoti(ctx.chat?.id.toString())),
        })

        notificationMenu.toggle("Promemoria", "promemoria", {
            setFunc: ((ctx, newState) => { userList.editNotificationRemember(ctx.chat?.id?.toString(), newState) }),
            isSetFunc: ((ctx) => userList.getNotificationRemember(ctx.chat?.id?.toString())),
        })

        notificationMenu.setCommand("notifiche")
        return notificationMenu.init();
    }

    private async voti(ctx: Context, onlyLast: boolean = false) {
        const username = userList.getUserByChatId(ctx.chat?.id.toString());
        if (!username) {
            return
        }
        let msg = await this.sendReply(ctx, "Loading ...")
        if (msg) {
            this.editMessage(ctx, msg, await votiManager.getVotiMsg(username, onlyLast))
        }
    }

    private async stalker(ctx: Context) {
        const input = ctx.message?.text?.split(" ");
        if (!input || input.length < 2 || !input[1] || input[1].indexOf('.') < 0) {
            this.sendReply(ctx, "Il messaggio deve essere nel formato\n/stalker nome.cognome")
            return;
        }

        const msg = await this.sendReply(ctx, "Loading ...")
        if (msg) {
            this.editMessage(ctx, msg, await votiManager.getVotiMsg(input[1].toLowerCase()))
        }
    }

    private async dimenticami(ctx: Context) {
        userList.removeUsername(ctx.chat?.id.toString())
        this.sendReply(ctx, "I tuoi dati sono stati rimossi")
    }


    public sendMessage(chatId: string, text: string) {
        try {
            this.bot.telegram.sendMessage(chatId, text);
        } catch (err) {
            console.log(err);
        }
    }

    private async sendReply(ctx: Context, text: string): Promise<Message | undefined> {
        try {
            return await ctx.reply(text)
        } catch (err) {
            console.log("Error sendig message")
        }
    }

    private editMessage(ctx: Context, msg: Message, text: string) {
        try {
            ctx.telegram.editMessageText(ctx.chat?.id, msg.message_id, undefined, text)
        } catch (err) {
            console.log("Error editing Message")
        }
    }


    public async sendFile(chatId: string, fileName: string) {
        try {
            this.bot.telegram.sendDocument(chatId, {
                source: fileName
            })
        } catch (err) {
            console.log(err)
        }
    }



}

const bot = new Bot();
export default bot;
