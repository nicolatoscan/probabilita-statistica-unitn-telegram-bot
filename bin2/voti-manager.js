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
const axios_1 = require("axios");
class VotiManager {
    constructor() {
    }
    getVoti(username) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Voti di " + username);
            let xocpu = (yield axios_1.default.post('http://datascience.maths.unitn.it/ocpu/library/doexercises/R/renderResults', { input_user: username })).headers['x-ocpu-session'];
            let html = (yield axios_1.default.get(`http://datascience.maths.unitn.it/ocpu/tmp/${xocpu}/files/output.html`)).data;
            if (html.indexOf("Impossibile trovare i risultati") >= 0)
                return null;
            let start = html.indexOf('<table class="table" id="results_table">');
            let end = html.indexOf('</table>', start);
            if (start < 0 || end < 0)
                return null;
            html = html.substring(start, end);
            start = html.indexOf('<tbody>');
            end = html.indexOf("</tbody>", start);
            if (start < 0 || end < 0)
                return null;
            start += 8;
            html = html.substring(start, end);
            let lines = html.split('\n').filter(s => s &&
                s.indexOf('tr') < 0 &&
                s.indexOf('td') < 0);
            let voti = [];
            for (let i = 1; i < lines.length; i += 2) {
                voti.push({
                    date: lines[i - 1],
                    value: parseFloat(lines[i])
                });
            }
            return {
                voti: voti,
                avg: voti.map(v => v.value).reduce((a, b) => a + b) / voti.length
            };
        });
    }
    getVotiMsg(username, onlyLast = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!username)
                return "Username non trovato, puoi impostare l'username con\n/setusername nome.cognome";
            let voti = yield this.getVoti(username);
            if (!voti) {
                return "Impossibile trovare i voti";
            }
            let res = `Voti di: ${username}\n\nMedia: ${voti.avg}\n`;
            if (onlyLast) {
                if (voti.voti.length > 0)
                    res += `${voti.voti[0].date}: ${voti.voti[0].value}`;
            }
            else {
                res += voti.voti.map(v => `${v.date}: ${v.value}`).join("\n");
            }
            return res;
        });
    }
}
const votiManager = new VotiManager();
exports.default = votiManager;
