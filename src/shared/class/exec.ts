import { HookFunction } from "../datagen/hook";
import { HookInjectPoints } from "../enum";
import { CommandCtx } from "../types";
import { splitString } from "../util/str";
import { DbgIt } from "./dbgItBase";

export abstract class BaseExec {
	protected constructor(public readonly dbgit: DbgIt) {}

	public async runHooksOf(injectionPoint: HookInjectPoints, ...args: Parameters<HookFunction>) {
		let res: string | undefined = undefined;
		this.dbgit.registry.getHooksOf(injectionPoint).forEach((v) => {
			if (res !== undefined) return;
			const hookResult = v.hook(...args);
			if (hookResult !== undefined) res = hookResult;
		});
		if (res) throw res;
		return true;
	}

	public async execute(commandString: string, executor: Player) {
		const split = splitString(commandString, "%s");
		const commandName = split[0];
		if (!this.dbgit.registry.getCommands().has(commandName)) throw `No command ${commandName}`;
		const command = this.dbgit.registry.getCommands().get(commandName)!;
		split.remove(0);
		const ctx: CommandCtx = {
			Executor: executor,
			RawCommandString: commandString,
			RawArguments: split,
			CommandName: commandName,
			Group: command.getDef().Group,
			CommandDefinition: command.getDef(),
		};
		const args = split.mapFiltered((v, i) => {
			if (command.getArgs() === undefined) return undefined;
			const currentArgument = command.getArgs()!.getArguments()[i];
			if (!currentArgument) return;
			const result = currentArgument.transform(v, ctx);
			if (currentArgument.validate(result)) return result;
			throw `Invalid argument ${v} (expected ${currentArgument.getName()})`;
		});
		// We now need to remove all optional ending arguments from the array to ensure the size is correct.
		if (
			command.getArgs() &&
			split.size() <
				command
					.getArgs()!
					.getArgumentDef()
					.mapFiltered((v) => (v.Optional ? undefined : v))
					.size()
		) {
			throw `Expected ${
				command
					.getArgs()
					?.getArgumentDef()
					.mapFiltered((v) => v.Optional)
					.reduce((accumulator, isOptional) => {
						// Determine if any arguments of the array are optional
						if (accumulator === true) return accumulator;
						return isOptional;
					})
					? "at least "
					: ""
			}${
				command
					.getArgs()
					?.getArgumentDef()
					.mapFiltered((v) => (v.Optional ? undefined : v))
					.size() ?? 0
			} argument(s), got ${split.size()}`;
		}

		this.runHooksOf(HookInjectPoints.BeforeExecution, ctx).expect();
		const result = command.run(ctx, ...args);
		this.runHooksOf(HookInjectPoints.AfterExecution, ctx).expect();
		return result;
	}
}
