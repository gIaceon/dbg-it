import { DbgIt } from "../shared";
import { ExecServer } from "./exec";
import { ServerRegistry } from "./registry";
import { ServerReplicator } from "./replicator";

export const DbgItServer = new (class extends DbgIt {
	public registry = new ServerRegistry(this as DbgIt);
	public exec = new ExecServer(this as DbgIt);
	public replicator = new ServerReplicator(this as DbgIt);

	public constructor() {
		super();
	}

	public toString(): string {
		return "DbgItServer";
	}
})();
