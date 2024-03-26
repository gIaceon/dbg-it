import { Server, createRemotes, remote, throttleMiddleware } from "@rbxts/remo";
import { CommandDef } from "./types";
import { $terrify } from "rbxts-transformer-t-new";
import { t } from "@rbxts/t";

export const remotes = createRemotes({
	fetchCommandMetadata: remote<Server>()
		.returns(t.array<CommandDef>($terrify<CommandDef>()))
		.middleware(
			throttleMiddleware({
				throttle: 1,
			}),
		),
});
