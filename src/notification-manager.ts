import * as schedule from 'node-schedule'
import userList from './user-list';
import votiManager from './voti-manager';
import bot from '.';


class NotificationManager {

    constructor() {
    }

    public start() {
        schedule.scheduleJob({hour: 0, minute: 1}, () => this.sendNotification())
        schedule.scheduleJob({hour: 23, minute: 0}, () => this.rememberPeople())
    }


    public forceNotification() {
        this.sendNotification();
    }


    private async sendNotification() {
        let users = userList.getUserWithNotificationVoti();
        users.forEach(async (u) => {
            try {
                bot.sendMessage(u.chatId, await votiManager.getVotiMsg(u.username, true))
            } catch (error) {
                console.log(error)
            }
        })
    }

    private async rememberPeople() {
        let users = userList.getUserToRemember();
        users.forEach(async (u) => {
            try {
                bot.sendMessage(u.chatId, "Ricordati di consegnare l'esercizio di oggi");
            } catch (error) {
                console.log(error)                
            }
        })
    }
}

const notificationManager = new NotificationManager();
export default notificationManager;