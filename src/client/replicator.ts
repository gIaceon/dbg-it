import { HttpService } from "@rbxts/services";
import { DbgIt } from "../shared";
import { BaseReplicator } from "../shared/class/replicator";
import { CommandDef } from "../shared/types";
import { $terrify } from "rbxts-transformer-t-new";
import Log from "@rbxts/log";
import { remotes } from "../shared/remotes";

export class ClientReplicator extends BaseReplicator {
	private commandMap: Map<string, CommandDef> = new Map();
	constructor(dbgit: DbgIt) {
		super(dbgit);
		this.updateEntries();
		remotes.rebuild.connect(() => this.updateEntries());
	}
	public updateEntries() {
		Log.Debug("Commands updated, rebuilding replicated commands state...");
		this.commandMap.clear();
		this.replicatedCommands = this.replicationRoot
			.GetChildren()
			.mapFiltered((v) => (v.IsA("StringValue") ? v.Value : undefined))
			.mapFiltered((v) => {
				let result: CommandDef | undefined;
				pcall(() => {
					const parsed = HttpService.JSONDecode(v);
					if ($terrify<CommandDef>()(parsed)) result = parsed;
					else Log.Error(`Failed to parse! ({})`, v);
				});
				if (result !== undefined && !this.dbgit.registry.commandExists(result.Name)) {
					this.commandMap.set(result.Name, result);
					return result;
				}
			});
	}

	public commandExists(cmdName: string) {
		return this.commandMap.has(cmdName);
	}
}
