import * as schedule from 'node-schedule'
import userList from './user-list';
import votiManager from './voti-manager';
import bot from '.';


class NotificationManager {

    constructor() {
    }

    public start() {
        schedule.scheduleJob('1 0 * * 3-6,0', () => this.sendNotification())
        schedule.scheduleJob('0 23 * * 2-6', () => this.rememberPeople())
    }


    public forceNotification() {
        this.sendNotification();
    }


    private async sendNotification() {
        console.log(" -- Notifiche Iniziate")
        const users = userList.getUserWithNotificationVoti();
        for (let index = 0; index < users.length; index++) {
            const u = users[index];
            bot.sendMessage(u.chatId, await votiManager.getVotiMsg(u.username, true))
        }
        console.log(" -- Notifiche Finite")
    }

    private async rememberPeople() {
        const users = userList.getUserToRemember();
        users.forEach(async (u) => {
            bot.sendMessage(u.chatId, "Ricordati di consegnare l'esercizio di ieri");
        })
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;