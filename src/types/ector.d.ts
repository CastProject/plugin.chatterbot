declare class Ector {
    constructor(botname?: string, username?: string);
    rwc: any;
    cn: any;
    public setUser(username: string): string | Error;
    public setName(botname: string): string | Error;
    public addEntry(entry: string): string[];
    public generateForward(phraseNodes: string[], temperature: number): string[];
    public generateBackward(phraseNodes: string[], temperature: number): string[];
    public generateResponse(): {sentence: string, nodes: string[]};
    public linkNodesToLastSentence(nodes: string): void;
    public injectConceptNetwork(newConceptNetwork: any): void;
}

declare module "ector" {
    export = Ector;
}