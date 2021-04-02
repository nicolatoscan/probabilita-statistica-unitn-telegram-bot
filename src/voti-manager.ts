import axios from 'axios'
import { parse } from 'node-html-parser';

export interface Mark {
    date: string,
    value: number,
    weight: number,
    excluded: boolean
}

interface MarksInfo {
    marks: Mark[],
    avgs: string[],
}

class VotiManager {

    private cache: { [id: string]: {
        date: Date
        value: MarksInfo
    }} = {}

    constructor() {
    }

    private async getVotiFromWeb(username: string): Promise<MarksInfo | undefined> {

        try {
            const xocpu = (await axios.post(
                'http://datascience.maths.unitn.it/ocpu/library/psDoexercises/R/renderResults',
                { input_user: username }
            )).headers['x-ocpu-session'];
            const html = (await axios.get(`http://datascience.maths.unitn.it/ocpu/tmp/${xocpu}/files/output.html`)).data as string
                
            if (html.indexOf("Impossibile trovare i risultati") >= 0)
                return undefined;
                
            const parsedHtml = parse(html);

            const tablesLines = parsedHtml.querySelectorAll('#results_table tbody tr')

            const voti =tablesLines.map(tl => {
                const cells = tl.querySelectorAll('td').map(cell => cell.text.trim())
                return {
                    date: cells[1],
                    value: cells[2] === 'NA' ? 0 : parseFloat(cells[2]),
                    weight: parseFloat(cells[3]),
                    excluded: cells[4] !== 'No'
                } as Mark
            })
                .filter(v => !isNaN(v.value))
                .filter(v => v.date.substring(0, 7) > '2021-02')
                .sort((a, b) => b.date.localeCompare(a.date))

            const avgs = parsedHtml.querySelectorAll('p#media').map(avgHtml => avgHtml.text.trim());

            return {
                marks: voti,
                avgs: avgs
            };
        } catch (ex) {
            return undefined;
        }
    }

    public async getVoti(username: string): Promise<MarksInfo | undefined> {
        if (this.cache[username] &&
            this.cache[username].date.getDate() == new Date().getDate() &&
            this.cache[username].date.getMonth() == new Date().getMonth() &&
            this.cache[username].date.getFullYear() == new Date().getFullYear()
        ) {
            console.log(`Getting ${username} votes cached`)
            return this.cache[username].value;
        } else {
            console.log(`Getting ${username} votes`)
            const newValue = await this.getVotiFromWeb(username);
            if (newValue) {
                this.cache[username] = {
                    date: new Date(),
                    value: newValue
                }
                return newValue;
            }
        }

        return undefined;
    }

    public async getVotiMsg(username: string, onlyLast: boolean = false): Promise<string> {
        if (!username)
            return "Username non trovato, puoi impostare l'username con\n/setusername nome.cognome";

        const marksInfo = await this.getVoti(username);

        if (!marksInfo) {
            return "Impossibile trovare i voti";
        }

        const toPrintMarks = onlyLast ? marksInfo.marks.slice(0, 1) : marksInfo.marks

        return `Voti di: ${username}\n\n${marksInfo.avgs.join('\n')}\n\nVoti:\n` +
            toPrintMarks.map(v => `${v.date}: ${v.value}`).join("\n")
    }

    public async cleanCache() {
        this.cache = { }
    }

}

const votiManager = new VotiManager();
export default votiManager;