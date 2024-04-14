import { DbgIt } from "../shared";
import { ExecServer } from "./exec";
import { ServerRegistry } from "./registry";
import { ServerReplicator } from "./replicator";

export const DbgItServer = new (class extends DbgIt {
	/**
	 * Handles registration of commands, types, and hooks.
	 */
	public registry = new ServerRegistry(this as DbgIt);
	/**
	 * Handles execution of commands.
	 */
	public executor = new ExecServer(this as DbgIt);

	/** @hidden */
	public replicator = new ServerReplicator(this as DbgIt);

	public constructor() {
		super();
	}

	public toString(): string {
		return "DbgItServer";
	}
})();
