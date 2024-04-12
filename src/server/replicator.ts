import { Make } from "@rbxts/altmake";
import { DbgIt } from "../shared";
import { BaseReplicator } from "../shared/class/replicator";
import { remotes } from "../shared/remotes";

export class ServerReplicator extends BaseReplicator {
	private rebuildFireThread: thread | undefined;
	constructor(dbgit: DbgIt) {
		super(dbgit);
	}

	public buildReplicator() {
		// Rebuild the state to replicate properly
		this.replicationRoot.ClearAllChildren();
		this.dbgit.registry.getCommands().forEach((v) => {
			pcall(() =>
				Make("StringValue", {
					Name: v.getDef().Name,
					Parent: this.replicationRoot,
					Value: this.serializeCommand(v),
				}),
			);
		});
		this.attemptFireRebuild();
	}
	/**
	 * Attempt to not spam clients when registering new comands lol
	 */
	private attemptFireRebuild() {
		if (this.rebuildFireThread !== undefined) {
			task.cancel(this.rebuildFireThread);
			delete this.rebuildFireThread;
		}
		this.rebuildFireThread = task.defer(() => remotes.rebuild.fireAll());
	}
}
