import { HookFunction } from "../datagen/hook";
import { HookInjectPoints } from "../enum";
import { CommandCtx } from "../types";
import { splitString } from "../util/str";
import { DbgIt } from "./dbgItBase";

export abstract class BaseExec {
	protected constructor(public readonly dbgit: DbgIt) {}

	public runHooksOf(injectionPoint: HookInjectPoints, ...args: Parameters<HookFunction>): Promise<boolean> {
		return new Promise((resolve, reject) => {
			let res: string | undefined = undefined;
			this.dbgit.registry.getHooksOf(injectionPoint).forEach((v) => {
				if (res !== undefined) return;
				const hookResult = v.hook(...args);
				if (hookResult !== undefined) res = hookResult;
			});
			if (res) reject(res);
			return resolve(true);
		});
	}

	public execute(commandString: string, executor: Player): Promise<string | void | undefined> {
		return new Promise((resolve, reject) => {
			const split = splitString(commandString, "%s");
			const commandName = split[0];
			if (!this.dbgit.registry.getCommands().has(commandName)) return reject(`No command ${commandName}`);
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
			let possibleErr: string | undefined;
			const args = split.mapFiltered((v, i) => {
				if (possibleErr !== undefined) return undefined;
				if (command.getArgs() === undefined) return undefined;
				const currentArgument = command.getArgs()!.getArguments()[i];
				if (!currentArgument) return;
				const result = currentArgument.transform(v, ctx);
				if (currentArgument.validate(result)) return result;
				possibleErr = `Invalid argument ${v} (expected ${currentArgument.getName()})`;
			});
			if (possibleErr !== undefined) return reject(possibleErr);
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
				return reject(
					`Expected ${
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
					} argument(s), got ${split.size()}`,
				);
			}

			let err: string | undefined = undefined;

			this.runHooksOf(HookInjectPoints.BeforeExecution, ctx)
				.catch((e: string) => (err = e))
				.await();
			if (err !== undefined) return reject(err);

			const result = command.run(ctx, ...args);

			this.runHooksOf(HookInjectPoints.AfterExecution, ctx)
				.catch((e: string) => (err = e))
				.await();
			if (err !== undefined) return reject(err);
			return resolve(result);
		});
	}
}
