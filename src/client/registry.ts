import { DbgIt } from "../shared";
import { Command } from "../shared/class/cmd";
import { BaseRegistry } from "../shared/class/registry";
import { ClientReplicator } from "./replicator";

export class ClientRegistry extends BaseRegistry {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
	/** @hidden */
	public registerCommand<T extends unknown[]>(command: Command<T>): this {
		super.registerCommand(command);
		(this.dbgit.replicator as ClientReplicator).updateEntries();
		return this;
	}
}
