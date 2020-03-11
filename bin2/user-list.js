"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class UserList {
    constructor() {
        this.fileName = "usernames.json";
        this.users = {};
        if (fs.existsSync(this.fileName))
            this.readFile();
    }
    updateFile() {
        fs.writeFileSync(this.fileName, JSON.stringify(this.users));
    }
    readFile() {
        this.users = JSON.parse(fs.readFileSync(this.fileName).toString());
    }
    getUserByChatId(chatId) {
        return this.users[chatId].username;
    }
    addUser(chatId, username) {
        if (chatId) {
            this.users[chatId] = {
                username: username.toLowerCase(),
                notification: false
            };
            this.updateFile();
        }
    }
    editNotification(chatId, status) {
        if (this.users[chatId]) {
            if (this.users[chatId].notification !== status) {
                this.users[chatId].notification = status;
                this.updateFile();
            }
            return true;
        }
        else {
            return false;
        }
    }
    getUserWithNotification() {
        var res = [];
        for (let u in this.users) {
            if (this.users[u].notification)
                res.push({ username: this.users[u].username, chatId: u });
        }
        return res;
    }
}
const userList = new UserList();
exports.default = userList;
