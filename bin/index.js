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
dotenv.config();
const telegraf_1 = require("telegraf");
const user_list_1 = require("./user-list");
const notification_manager_1 = require("./notification-manager");
const voti_manager_1 = require("./voti-manager");
class Bot {
    constructor() {
        this.helpMessage = "Con questo bot potrai ricevere i voti degli esercizi di Proabilità e statistica con /voti o /ultimovoto,\n" +
            "Ricordati di impostare il tuo username con\n/setusername nome.cognome\n" +
            "(la matricola non è necessaria)\n" +
            "Se vuoi puoi ricevere automaticamente il nuovo voto a mezzanotte attivando le notifiche con /attivanotifiche";
        this.bot = new telegraf_1.default(process.env.BOT_TOKEN);
        this.middleware();
        this.bot.launch();
        notification_manager_1.default.set(this.bot);
    }
    middleware() {
        this.bot.start(ctx => ctx.reply(this.helpMessage));
        this.bot.help(ctx => ctx.reply(this.helpMessage));
        this.bot.command("/ping", ctx => ctx.reply("pong!"));
        this.bot.command("/setusername", ctx => this.setUsername(ctx));
        this.bot.command("/attivanotifiche", ctx => this.notificationToggle(ctx, true));
        this.bot.command("/disattivanotifiche", ctx => this.notificationToggle(ctx, false));
        this.bot.command("/voti", ctx => this.voti(ctx));
        this.bot.command("/ultimovoto", ctx => this.ultimoVoto(ctx));
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
    voti(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = user_list_1.default.getUserByChatId(ctx.chat.id.toString());
            if (username == null) {
                ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome");
                return;
            }
            let voti = yield voti_manager_1.default.getVoti(username);
            if (!voti) {
                ctx.reply("Impossibile trovare i voti");
                return;
            }
            let res = `Voti di: ${username}\n\nMedia: ${voti.avg}\n`;
            res += voti.voti.map(v => `${v.date}: ${v.value}`).join("\n");
            ctx.reply(res);
        });
    }
    ultimoVoto(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = user_list_1.default.getUserByChatId(ctx.chat.id.toString());
            if (username == null) {
                ctx.reply("Username non trovato, puoi impostare l'username con\n/setusername nome.cognome");
                return;
            }
            let voti = yield voti_manager_1.default.getVoti(username);
            if (!voti) {
                ctx.reply("Impossibile trovare i voti");
                return;
            }
            let res = `Ultimo voto di: ${username}\n\n`;
            res += `${voti.voti[0].date}: ${voti.voti[0].value}`;
            res += `Media: ${voti.avg}`;
            ctx.reply(res);
        });
    }
}
const bot = new Bot();
