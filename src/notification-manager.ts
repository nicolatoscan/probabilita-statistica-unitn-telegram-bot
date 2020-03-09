import * as schedule from 'node-schedule'
import userList from './user-list';
import Telegram, { ContextMessageUpdate } from "telegraf"


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


    private sendNotification() {
        if (!this.bot)
            return;

        let users = userList.getUserWithNotification();
        users.forEach((u) => {
            this.bot.telegram.sendMessage(u, "Ciaone");
        })
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;