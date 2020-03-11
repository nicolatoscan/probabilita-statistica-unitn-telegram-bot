import axios from 'axios'


export interface Voto {
    date: string,
    value: number
}

class VotiManager {

    constructor() {
    }

    public async getVoti(username: string): Promise<{ voti: Voto[], avg: number }> {

        console.log("Voti di " + username)

        let xocpu = (await axios.post(
            'http://datascience.maths.unitn.it/ocpu/library/doexercises/R/renderResults',
            { input_user: username }
        )).headers['x-ocpu-session'];

        let html: string = (await axios.get(`http://datascience.maths.unitn.it/ocpu/tmp/${xocpu}/files/output.html`)).data

        if (html.indexOf("Impossibile trovare i risultati") >= 0)
            return null;

        let start = html.indexOf('<table class="table" id="results_table">')
        let end = html.indexOf('</table>', start)

        if (start < 0 || end < 0)
            return null;


        html = html.substring(start, end);
        start = html.indexOf('<tbody>');
        end = html.indexOf("</tbody>", start);
        if (start < 0 || end < 0)
            return null;
        
        start += 8;
        html = html.substring(start, end);

        let lines = html.split('\n').filter(s =>
            s &&
            s.indexOf('tr') < 0 &&
            s.indexOf('td') < 0
            );

        let voti: Voto[] = [];

        for (let i = 1; i < lines.length; i += 2) {
            voti.push({
                date: lines[i - 1],
                value: parseFloat(lines[i])
            })
        }
        
        return {
            voti: voti,
            avg: voti.map(v => v.value).reduce((a, b) => a + b) / voti.length
        };

    }

    public async getVotiMsg(username: string, onlyLast: boolean = false): Promise<string> {
        if (!username)
            return "Username non trovato, puoi impostare l'username con\n/setusername nome.cognome";

        let voti = await this.getVoti(username);

        if (!voti) {
            return "Impossibile trovare i voti";
        }

        let res = `Voti di: ${username}\n\nMedia: ${voti.avg}\n`;
        if (onlyLast) {
            if (voti.voti.length > 0)
                res += `${voti.voti[0].date}: ${voti.voti[0].value}`
        } else {
            res += voti.voti.map(v => `${v.date}: ${v.value}`).join("\n")
        }

        return res;

    }

}

const votiManager = new VotiManager();
export default votiManager;