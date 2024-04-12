import { BaseRegistry, DbgIt } from "../shared";
import { Command } from "../shared/class/cmd";
import { ServerReplicator } from "./replicator";

export class ServerRegistry extends BaseRegistry {
	public constructor(public readonly dbgit: DbgIt) {
		super(dbgit);
	}
	public registerCommand<T extends unknown[]>(command: Command<T>): this {
		super.registerCommand(command);
		(this.dbgit.replicator as ServerReplicator).buildReplicator();
		return this;
	}
}
