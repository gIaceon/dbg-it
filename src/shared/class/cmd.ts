import { RunService } from "@rbxts/services";
import { ArgumentBuilder, ExtractTupleFromArgBuilder } from "../datagen/type";
import { CommandGroups } from "../enum";
import { CommandCtx, CommandDef } from "../types";
import { BaseRegistry } from "./registry";

export class Command<A extends [...unknown[]] = unknown[]> {
	protected exec?: (ctx: CommandCtx, ...args: A) => string | undefined | void;
	protected args?: ArgumentBuilder<unknown[]>;
	protected constructor(
		private readonly definition: Readonly<CommandDef>,
		private readonly registry: BaseRegistry,
	) {}

	/** @hidden */
	public injectExecMethod(exec?: (ctx: CommandCtx, ...args: A) => string | undefined | void) {
		this.exec = exec;
		return this;
	}

	/** @hidden */
	public injectArguments<T extends ArgumentBuilder<[...unknown[]]>>(args?: T) {
		this.args = args;
		return this as never as Command<ExtractTupleFromArgBuilder<T>>;
	}

	public register() {
		if (this.args) this.registry.registerTypesFromArgs(this.args);
		this.registry.registerCommand(this);
		return this;
	}

	/** @hidden */
	public run(ctx: CommandCtx, ...args: A) {
		return this.exec !== undefined ? this.exec(ctx, ...args) : undefined;
	}

	public getDef(): Readonly<CommandDef> {
		return this.definition;
	}

	public getArgs(): ArgumentBuilder<A> | undefined {
		return this.args;
	}

	/** @hidden */
	public static fromDef(definition: CommandDef, reg: BaseRegistry) {
		return new Command({ ...definition }, reg);
	}

	/** @hidden */
	public static empty(reg: BaseRegistry) {
		return new Command(
			{ Name: "", Arguments: [], Group: CommandGroups.Misc, IsServer: RunService.IsServer() },
			reg,
		);
	}
}
