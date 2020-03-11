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
const schedule = require("node-schedule");
const user_list_1 = require("./user-list");
const voti_manager_1 = require("./voti-manager");
class NotificationManager {
    constructor() {
        this.bot = null;
        schedule.scheduleJob({ hour: 0, minute: 1 }, () => this.sendNotification());
    }
    set(bot) {
        this.bot = bot;
    }
    forceNotification() {
        this.sendNotification();
    }
    sendNotification() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.bot)
                return;
            let users = user_list_1.default.getUserWithNotification();
            users.forEach((u) => __awaiter(this, void 0, void 0, function* () {
                console.log();
                this.bot.telegram.sendMessage(u.chatId, yield voti_manager_1.default.getVotiMsg(u.username, true));
            }));
        });
    }
}
const notificationManager = new NotificationManager();
exports.default = notificationManager;
