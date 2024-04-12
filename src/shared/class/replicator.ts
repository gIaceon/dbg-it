import { Make } from "@rbxts/altmake";
import { HttpService, ReplicatedStorage, RunService } from "@rbxts/services";
import { Command } from "./cmd";
import { CommandDef } from "../types";
import { DbgIt } from "./dbgItBase";

export abstract class BaseReplicator {
	protected readonly replicationRootName = "__dbg-it!__replicationRoot__";
	protected readonly replicationAttrKey = "DBGIT_REPLICATION";
	public readonly replicationRoot: Folder;
	public replicatedCommands: readonly CommandDef[] = [];
	constructor(public readonly dbgit: DbgIt) {
		const maybeF = RunService.IsClient()
			? ReplicatedStorage.WaitForChild(this.replicationRootName, 10)
			: ReplicatedStorage.FindFirstChild(this.replicationRootName);
		this.replicationRoot = maybeF! as never;
		if (maybeF === undefined && RunService.IsServer())
			this.replicationRoot = Make("Folder", {
				Parent: ReplicatedStorage,
				Name: this.replicationRootName,
			}) as never;
	}
	public serializeCommand(command: Command<[...unknown[]]>): string {
		return HttpService.JSONEncode(command.getDef());
	}
	public getReplicatedCommands() {
		return this.replicatedCommands as ReadonlyArray<CommandDef>;
	}
}
