import { DbgIt, logType } from "../shared";
import { registerBuiltins } from "./builtins";
import { ExecClient } from "./exec";
import { ClientRegistry } from "./registry";

export const DbgItClient = new (class extends DbgIt {
	public messageHistory: logType[] = [];
	public exec = new ExecClient(this as DbgIt);
	public registry = new ClientRegistry(this as DbgIt);
	public toString(): string {
		return `DbgIt!`;
	}
	constructor() {
		super();
	}
	public async registerBuiltins() {
		super.registerBuiltins().expect();
		registerBuiltins(this.registry);
	}
	public async runCommand(cmd: string) {
		return this.exec.execute(cmd);
	}
})();
