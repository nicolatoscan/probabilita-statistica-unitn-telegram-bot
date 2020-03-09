import * as schedule from 'node-schedule'
import userList from './user-list';
import Telegram, { ContextMessageUpdate } from "telegraf"
import votiManager from './voti-manager';


class NotificationManager {

    private bot: Telegram<ContextMessageUpdate> = null

    constructor() {
        schedule.scheduleJob({hour: 0, minute: 1}, () => this.sendNotification())
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

        let users = userList.getUserWithNotification();
        users.forEach(async (u) => {
            console.log()
            this.bot.telegram.sendMessage(u.chatId, await votiManager.getVotiMsg(u.username, true));
        })
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;