import * as schedule from 'node-schedule'
import userList from './user-list';
import Telegram, { ContextMessageUpdate } from "telegraf"
import votiManager from './voti-manager';


class NotificationManager {

    private bot: Telegram<ContextMessageUpdate> = null

    constructor() {
        schedule.scheduleJob({hour: 0, minute: 1}, () => this.sendNotification())
        schedule.scheduleJob({hour: 23, minute: 0}, () => this.rememberPeople())
    }


    public set(bot: Telegram<ContextMessageUpdate>) {
        this.bot = bot;
    }

    public forceNotification() {
        this.sendNotification();
    }


    private async sendNotification() {
        if (!this.bot)
            return;

        let users = userList.getUserWithNotificationVoti();
        users.forEach(async (u) => {
            try {
                this.bot.telegram.sendMessage(u.chatId, await votiManager.getVotiMsg(u.username, true));
            } catch (error) {
                console.log(error)
            }
        })
    }

    private async rememberPeople() {
        if (!this.bot)
            return;

        let users = userList.getUserToRemember();
        users.forEach(async (u) => {
            try {
                this.bot.telegram.sendMessage(u.chatId, "Ricordati di consegnare l'esercizio di oggi");
            } catch (error) {
                console.log(error)                
            }
        })
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;