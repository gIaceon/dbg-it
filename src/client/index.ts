import { DbgIt, logType } from "../shared";
import { Command } from "../shared/class/cmd";
import { BaseReplicator } from "../shared/class/replicator";
import { getBuiltins } from "./builtins";
import { ExecClient } from "./exec";
import { ClientRegistry } from "./registry";
import { ClientReplicator } from "./replicator";

export const DbgItClient = new (class extends DbgIt {
	public messageHistory: logType[] = [];
	public exec = new ExecClient(this as DbgIt);
	public registry = new ClientRegistry(this as DbgIt);
	public replicator: BaseReplicator = new ClientReplicator(this as DbgIt);
	public toString(): string {
		return `DbgIt!`;
	}
	constructor() {
		super();
	}
	public async registerBuiltins(
		validator: (cmds: Command<[...unknown[]]>) => Command<[...unknown[]]> | undefined = (cmd) => cmd,
	) {
		super.registerBuiltins(validator).expect();
		getBuiltins(this.registry)
			.mapFiltered(validator)
			.forEach((v) => v.register());
	}
	public async runCommand(cmd: string) {
		return this.exec.execute(cmd);
	}
})();
