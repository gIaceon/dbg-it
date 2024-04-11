import { remotes } from "../remotes";
import { Type } from "./type";
import { Command } from "./cmd";
import { ArgumentBuilder } from "../datagen/type";
import { TypeDef } from "../types";
import { DbgIt } from "./dbgItBase";
import { HookBuilder } from "../datagen/hook";
import { HookInjectPoints } from "../enum";
import { paginate } from "../util/paginate";

const CMDS_PAGE_ELEM_COUNT = 10;

export abstract class BaseRegistry {
	protected commands: Map<string, Command<unknown[]>> = new Map();
	protected types: Map<string, Type<unknown>> = new Map();
	protected typeDefs: Map<string, TypeDef> = new Map();
	protected hooks: Map<string, HookBuilder> = new Map();
	protected constructor(public readonly dbgit: DbgIt) {}

	public registerCommand<T extends unknown[]>(command: Command<T>) {
		this.commands.set(command.getDef().Name, command as never);
		return this;
	}

	public registerType(def: TypeDef, typeClass: Type<unknown>) {
		this.typeDefs.set(def.Type, def);
		this.types.set(def.Type, typeClass);
	}

	public registerTypesFromArgs<S extends unknown[]>(args: ArgumentBuilder<S>) {
		args.build().forEach((v, i) => this.registerType(v, args.getArguments()[i]));
		return this;
	}

	public registerHook(hook: HookBuilder) {
		this.hooks.set(hook.build().HookName, hook);
		return this;
	}

	public getHooksOf(injectionPoint: HookInjectPoints) {
		const result: HookBuilder[] = [];
		this.hooks.forEach((v) => (v.build().InjectionPoint === injectionPoint ? result.push(v) : undefined));
		return result;
	}

	public getCommands(): ReadonlyMap<string, Command<unknown[]>> {
		return this.commands;
	}

	public getTypes(): ReadonlyMap<string, Type<unknown>> {
		return this.types;
	}

	public getCmdsPage(page: number) {
		// TODO Commands are not in order of registry.
		// TODO: Performance may not be the best here with large amounts of commands.
		const commandsArr: Command<unknown[]>[] = [];
		this.commands.forEach((v) => commandsArr.push(v));
		return paginate(
			commandsArr.mapFiltered(
				(v) =>
					`${v.getDef().Name}: ${
						// For optional arguments: add a "?" after the type name
						v
							.getArgs()
							?.getArgumentDef()
							.mapFiltered((v) => `${v.Type.getName()}${v.Optional ? "?" : ""}`)
							.join() ?? ""
					} (${v.getDef().Description?.gsub("\n", " ")[0]})`,
			),
			page,
			CMDS_PAGE_ELEM_COUNT,
		);
	}
}
