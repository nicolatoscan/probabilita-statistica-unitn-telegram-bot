import express from 'express'
import axios from 'axios'

export default class Server {
    private server: express.Express;
    private pingUrl: string | undefined;

    constructor() {
        this.server = express();

        this.server.get('/', (req, res) => {
            res.send("I'm OK!");
        })

        const port = process.env.PORT
        this.server.listen(port, () => {
            console.log(`Server listening on ${port}`);
        })

        this.pingUrl = process.env.PING_URL;
        const PING_TIMEOUT = 25*60*1000;
        if (this.pingUrl) {
            setTimeout(async () => { 
                await this.ping();
            }, PING_TIMEOUT)
        }
    }

    public async ping() {
        if (this.pingUrl) {
            try {
                await axios.get(this.pingUrl)
                console.log(`Pinged ${this.pingUrl}`);
            } catch (er) {
                console.log(er);
                console.log(`Could not ping ${this.pingUrl}`);
            }
        }
    }
}
