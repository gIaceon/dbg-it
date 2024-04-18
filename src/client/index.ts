import { DbgIt } from "../shared";
import { Command } from "../shared/class/cmd";
import { BaseReplicator } from "../shared/class/replicator";
import { getBuiltins } from "./builtins";
import { ExecClient } from "./exec";
import { ClientRegistry } from "./registry";
import { ClientReplicator } from "./replicator";

export const DbgItClient = new (class extends DbgIt {
	/**
	 * Handles registration of commands, types, and hooks.
	 */
	public registry = new ClientRegistry(this as DbgIt);
	/**
	 * Handles execution of commands.
	 */
	public executor = new ExecClient(this as DbgIt);

	/** @hidden */
	public replicator: BaseReplicator = new ClientReplicator(this as DbgIt);

	constructor() {
		super();
	}

	/**
	 * Registers client-scoped built-in commands which come with Dbg-It
	 * @param validator A function which returns the command passed to it if it is a valid command.
	 */
	public async registerBuiltins(
		validator: (cmds: Command<[...unknown[]]>) => Command<[...unknown[]]> | undefined = (cmd) => cmd,
	) {
		super.registerBuiltins(validator).expect();
		getBuiltins(this.registry)
			.mapFiltered(validator)
			.forEach((v) => v.register());
	}

	public toString(): string {
		return `DbgIt!`;
	}
})();
