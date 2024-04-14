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
	/** @hidden */
	public LogSink = new DbgItLoggingSink();
	public Logger: Logger = Log.Configure()
		.WriteTo({ Emit(message) {} })
		.Create();

	/**
	 * Handles registration of commands, types, and hooks.
	 */
	public abstract registry: BaseRegistry;
	/**
	 * Handles execution of commands.
	 */
	public abstract executor: BaseExec;

	/** @hidden */
	public abstract replicator: BaseReplicator;

	protected constructor() {}

	/**
	 * Configures Dbg-It's built-in logging.
	 *
	 * ### Middleware
	 * You can add middleware using the `configure` parameter:
	 * ```
	 * DbgIt.configureLogging(
	 * 	// **This function will run the middleware function with all previous logs created before!**
	 * 	(sink) => sink.addMiddleware(
	 * 		// Print new logs using `print`
	 * 		(severity: LogLevel, time: string | undefined, message: string) => print(message),
	 * 	),
	 * );
	 * ```
	 * Middleware should not yield, however if it does it will be run under a coroutine.
	 * @param configure Function which passes in the {@link DbgItLoggingSink}, which can be used to add middleware.
	 */
	public configureLogging(configure: (sink: Omit<DbgItLoggingSink, "Emit">) => void = () => {}) {
		this.Logger = Log.Configure().WriteTo(this.LogSink, configure).Create();
	}

	public abstract toString(): string;

	/**
	 * Registers shared-scoped built-in commands which come with Dbg-It
	 * @param validator A function which returns the command passed to it if it is a valid command.
	 */
	public async registerBuiltins(
		validator: (cmds: Command<[...unknown[]]>) => Command<[...unknown[]]> | undefined = (cmd) => cmd,
	) {
		getBuiltins(this.registry)
			.mapFiltered(validator)
			.forEach((v) => v.register());
	}

	/**
	 * @deprecated
	 * @hidden
	 */
	public getLogger() {
		return this.Logger;
	}
}
