import {Cast, CommandContainer, Container, Logger, Plugin} from "cast";
import {Message} from "discord.js";
import Ector = require("ector");
import {EventEmitter} from "events";
import * as path from "path";

export class Chatterbot extends EventEmitter implements Plugin {
    public cast: Cast;
    public commands: CommandContainer;
    public logger: Logger;
    public name: string = "chatterbot";
    public version: string | number = "1.0.0";
    public debugMode: boolean = false;
    public pluginConfig: object;
    public listeningEvents: string[] = ["message"];
    public id: string = "chatterbot";

    private chatterBot: Ector;

    private triggerWords: string[] = [];

    private container: Container;

    private ectorData: {
        previousResponseNodes: any,
    } = {previousResponseNodes: null};

    public async onLoad(cast: Cast, logger: Logger, container: Container): Promise<void> {
        this.cast = cast;
        this.logger = logger;
        this.commands = this.cast.createCommandContainer(path.join(__dirname, "commands"), this);
        this.chatterBot = new Ector();
        this.triggerWords = [`<@${this.cast.client.user.id}>`];
        this.container = container;
        this.loadEvents();
    }

    public async onEnable(): Promise<any> {
        const cn = await this.container.getItem("ectorCN");
        if (cn) {
            Object.assign(this.chatterBot.cn, cn);
        }
        await this.commands.loadAll();
    }

    public async onDisable(): Promise<any> {
        await this.container.setItem("ectorCN", this.chatterBot.cn);
        await this.commands.unloadAll();
    }

    private async isValid(message: Message): Promise<string | null> {
        let result: string | null = null;
        this.triggerWords.forEach((trigger) => {
            if (message.content.startsWith(trigger.toLowerCase())) {
                result = message.content.substring(trigger.length);
            }
        });
        return result;
    }

    private loadEvents(): void {
        this.on("message", async (message: Message) => {
            const phrase: string | null = await this.isValid(message);
            if (!phrase) {
                return;
            }
            const entry = phrase;
            this.chatterBot.addEntry(entry);
            this.chatterBot.linkNodesToLastSentence(this.ectorData.previousResponseNodes);
            const response = this.chatterBot.generateResponse();
            this.ectorData.previousResponseNodes = response.nodes;
            message.channel.send(response.sentence);
        });
    }

}
