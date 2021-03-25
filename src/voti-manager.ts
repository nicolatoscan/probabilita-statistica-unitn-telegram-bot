import axios from 'axios'


export interface Voto {
    date: string,
    value: number
}

class VotiManager {

    private cache: { [id: string]: {
        date: Date
        value: { voti: Voto[], avg: number }
    }} = {}

    constructor() {
    }

    private async getVotiFromWeb(username: string): Promise<{ voti: Voto[], avg: number } | undefined> {

        console.log("Voti di " + username)

        const xocpu = (await axios.post(
            'http://datascience.maths.unitn.it/ocpu/library/doexercises/R/renderResults',
            { input_user: username }
        )).headers['x-ocpu-session'];

        let html: string = (await axios.get(`http://datascience.maths.unitn.it/ocpu/tmp/${xocpu}/files/output.html`)).data

        if (html.indexOf("Impossibile trovare i risultati") >= 0)
            return undefined;

        let start = html.indexOf('<table class="table" id="results_table">')
        let end = html.indexOf('</table>', start)

        if (start < 0 || end < 0)
            return undefined;


        html = html.substring(start, end);
        start = html.indexOf('<tbody>');
        end = html.indexOf("</tbody>", start);
        if (start < 0 || end < 0)
            return undefined;

        start += 8;
        html = html.substring(start, end);

        const lines = html.split('\n').filter(s =>
            s &&
            s.indexOf('tr') < 0 &&
            s.indexOf('td') < 0
        );

        const voti: Voto[] = [];

        for (let i = 2; i < lines.length; i += 3) {
            voti.push({
                date: lines[i - 1],
                value: parseFloat(lines[i])
            })
        }

        return {
            voti: voti,
            avg: voti.length == 0 ? 0 : voti.map(v => v.value).reduce((a, b) => a + b) / voti.length
        };

    }

    public async getVoti(username: string): Promise<{ voti: Voto[], avg: number } | undefined> {
        if (this.cache[username] &&
            this.cache[username].date.getDate() == new Date().getDate() &&
            this.cache[username].date.getMonth() == new Date().getMonth() &&
            this.cache[username].date.getFullYear() == new Date().getFullYear()
            ) {

                console.log("Cached")
                return this.cache[username].value;
        } else {
            
            let newValue = undefined
            try {
                newValue = await this.getVotiFromWeb(username);
            } catch (error) {
                console.log("Error getting voti")                
            }
            if (newValue) {
                this.cache[username] = {
                    date: new Date(),
                    value: newValue
                }
            }
                
            return newValue
        }
    }

    public async getVotiMsg(username: string, onlyLast: boolean = false): Promise<string> {
        if (!username)
            return "Username non trovato, puoi impostare l'username con\n/setusername nome.cognome";

        const voti = await this.getVoti(username);

        if (!voti) {
            return "Impossibile trovare i voti";
        }

        let res = `Voti di: ${username}\n\nMedia: ${voti.avg?.toString()?.substring(0, 5)}\n`;
        if (onlyLast) {
            if (voti.voti.length > 0)
                res += `${voti.voti[0].date}: ${voti.voti[0].value}`
        } else {
            res += voti.voti.map(v => `${v.date}: ${v.value}`).join("\n")
        }

        return res;

    }

    public async cleanCache() {
        this.cache = { }
    }

}

const votiManager = new VotiManager();
export default votiManager;