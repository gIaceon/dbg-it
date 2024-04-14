import Log, { Logger } from "@rbxts/log";
import { DbgItLoggingSink } from "./logging";
import { ILogEventSink, LogLevel } from "@rbxts/log/out/Core";
import { toStr } from "../impl/tostr";
import { BaseRegistry } from "./registry";
import { BaseExec } from "./exec";
import { getBuiltins } from "../builtins";
import { BaseReplicator } from "./replicator";
import { Command } from "./cmd";

export interface logType {
	level: LogLevel;
	time: string | undefined;
	message: string;
}

export abstract class DbgIt implements toStr {
	public LogSink = new DbgItLoggingSink();
	public Logger: Logger = Log.Configure()
		.WriteTo({ Emit(message) {} })
		.Create();
	public messageHistory: logType[] = [];
	public abstract registry: BaseRegistry;
	public abstract exec: BaseExec;
	public abstract replicator: BaseReplicator;
	protected constructor() {}

	public configureLogging(configure: (sink: Omit<DbgItLoggingSink, "Emit">) => void = () => {}) {
		this.Logger = Log.Configure().WriteTo(this.LogSink, configure).Create();
	}

	public abstract toString(): string;

	public async registerBuiltins(
		validator: (cmds: Command<[...unknown[]]>) => Command<[...unknown[]]> | undefined = (cmd) => cmd,
	) {
		getBuiltins(this.registry)
			.mapFiltered(validator)
			.forEach((v) => v.register());
	}

	public getLogger() {
		return this.Logger;
	}
}
