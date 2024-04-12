import { Client, Server, createRemotes, remote } from "@rbxts/remo";
import { t } from "@rbxts/t";
import { $terrify } from "rbxts-transformer-t-new";
import { ServerExecutionResult } from "./types";

export const remotes = createRemotes({
	executeCommand: remote<Server, [commandArgs: string]>(t.string).returns<ServerExecutionResult>(
		$terrify<ServerExecutionResult>(),
	),
	rebuild: remote<Client>(),
});
