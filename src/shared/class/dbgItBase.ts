import Log, { Logger } from "@rbxts/log";
import { DbgItLoggingSink } from "./logging";
import { ILogEventSink, LogLevel } from "@rbxts/log/out/Core";
import { toStr } from "../impl/tostr";
import { BaseRegistry } from "./regBase";
import { BaseExec } from "./exec";
import { registerBuiltins } from "../builtins";

export interface logType {
	level: LogLevel;
	time: string | undefined;
	message: string;
}

export abstract class DbgIt implements toStr {
	public LogSink = DbgItLoggingSink;
	public Logger: Logger = Log.Default();
	public messageHistory: logType[] = [];
	public abstract registry: BaseRegistry;
	public abstract exec: BaseExec;
	protected constructor() {}

	public configureLogging<S extends ILogEventSink>(
		customSink: S = new this.LogSink({
			logMiddleware: (level, time, message) =>
				this.messageHistory.push({ level: level, time: time, message: message }),
		}) as never,
		configure?: (sink: Omit<S, "Emit">) => void,
	) {
		this.Logger = Log.Configure().WriteTo(customSink, configure).Create();
	}

	public abstract toString(): string;

	public async registerBuiltins() {
		registerBuiltins(this.registry);
	}

	public getLogger() {
		return this.Logger;
	}
}
