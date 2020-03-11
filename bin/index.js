"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const telegraf_1 = require("telegraf");
const telegraf_inline_menu_1 = require("telegraf-inline-menu");
const user_list_1 = require("./user-list");
const notification_manager_1 = require("./notification-manager");
const voti_manager_1 = require("./voti-manager");
dotenv.config();
class Bot {
    constructor() {
        this.helpMessage = "Con questo bot potrai ricevere i voti degli esercizi di Proabilità e statistica con /voti o /ultimovoto,\n\n" +
            "Ricordati di impostare il tuo username con\n/setusername nome.cognome\n" +
            "(la matricola non è necessaria)\n\n" +
            "Se vuoi puoi ricevere automaticamente il nuovo voto a mezzanotte e un promemoria di inviare l'esercizio alle 23 attivando le /notifiche\n\n" +
            "Se il bot non funziona come dovrebbe o hai dei seggerimenti, contattami a @nicolatoscan";
        this.bot = new telegraf_1.default(process.env.BOT_TOKEN);
        this.middleware();
        this.bot.launch();
        notification_manager_1.default.set(this.bot);
    }
    middleware() {
        this.bot.start(ctx => ctx.reply(this.helpMessage));
        this.bot.help(ctx => ctx.reply(this.helpMessage));
        this.bot.use(this.setMenuNotifiche());
        this.bot.command("/ping", ctx => ctx.reply("pong!"));
        this.bot.command("/setusername", ctx => this.setUsername(ctx));
        this.bot.command("/voti", ctx => this.voti(ctx));
        this.bot.command("/ultimovoto", ctx => this.ultimoVoto(ctx));
        this.bot.on('message', ctx => { ctx.reply("Comando non trovato, puoi utilizare /help per aiuto"); });
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
    setMenuNotifiche() {
        const notificationMenu = new telegraf_inline_menu_1.default('Scegli la tipologia');
        notificationMenu.toggle("Voto", "voto", {
            setFunc: ((ctx, newState) => { user_list_1.default.editNotificationVoti(ctx.chat.id.toString(), newState); }),
            isSetFunc: ((ctx) => user_list_1.default.getNotificationVoti(ctx.chat.id.toString())),
        });
        notificationMenu.toggle("Promemoria", "promemoria", {
            setFunc: ((ctx, newState) => { user_list_1.default.editNotificationRemember(ctx.chat.id.toString(), newState); }),
            isSetFunc: ((ctx) => user_list_1.default.getNotificationRemember(ctx.chat.id.toString())),
        });
        notificationMenu.setCommand("notifiche");
        return notificationMenu.init();
    }
    voti(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = user_list_1.default.getUserByChatId(ctx.chat.id.toString());
            let msg = ctx.reply("Loading ...");
            ctx.telegram.editMessageText(ctx.chat.id, (yield msg).message_id, null, yield voti_manager_1.default.getVotiMsg(username));
        });
    }
    ultimoVoto(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = user_list_1.default.getUserByChatId(ctx.chat.id.toString());
            let msg = ctx.reply("Loading ...");
            ctx.telegram.editMessageText(ctx.chat.id, (yield msg).message_id, null, yield voti_manager_1.default.getVotiMsg(username, true));
        });
    }
}
const bot = new Bot();
