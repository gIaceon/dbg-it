import { Type } from "./type";
import { Command } from "./cmd";
import { ArgumentBuilder } from "../datagen/type";
import { CommandDef, TypeDef } from "../types";
import { DbgIt } from "./dbgItBase";
import { HookBuilder } from "../datagen/hook";
import { CommandGroups, HookInjectPoints } from "../enum";
import { paginate } from "../util/paginate";

const CMDS_PAGE_ELEM_COUNT = 10;

/**
 * Handles registration of commands, types, and hooks.
 */
export abstract class BaseRegistry {
	protected commands: Map<string, Command<unknown[]>> = new Map();
	protected types: Map<string, Type<unknown>> = new Map();
	protected typeDefs: Map<string, TypeDef> = new Map();
	protected hooks: Map<string, HookBuilder> = new Map();
	protected constructor(public readonly dbgit: DbgIt) {}

	/** @hidden */
	public registerCommand<T extends unknown[]>(command: Command<T>) {
		this.commands.set(command.getDef().Name, command as never);
		return this;
	}

	/** @hidden */
	public registerType(def: TypeDef, typeClass: Type<unknown>) {
		this.typeDefs.set(def.Type, def);
		this.types.set(def.Type, typeClass);
	}

	/** @hidden */
	public registerTypesFromArgs<S extends unknown[]>(args: ArgumentBuilder<S>) {
		args.build().forEach((v, i) => this.registerType(v, args.getArguments()[i]));
		return this;
	}

	/** @hidden */
	public registerHook(hook: HookBuilder) {
		this.hooks.set(hook.build().HookName, hook);
		return this;
	}

	/** @hidden */
	public getHooksOf(injectionPoint: HookInjectPoints) {
		const result: HookBuilder[] = [];
		this.hooks.forEach((v) => (v.build().InjectionPoint === injectionPoint ? result.push(v) : undefined));
		return result;
	}

	/** @hidden */
	public getCommands(): ReadonlyMap<string, Command<unknown[]>> {
		return this.commands;
	}

	/** @hidden */
	public getTypes(): ReadonlyMap<string, Type<unknown>> {
		return this.types;
	}

	/** @hidden */
	public helpPage(page: number) {
		const commandsArr: CommandDef[] = [];
		this.commands.forEach((v) => commandsArr.push(v.getDef()));
		this.dbgit.replicator.getReplicatedCommands().forEach((v) => commandsArr.push(v));
		return paginate(
			commandsArr.mapFiltered(
				(v) =>
					`${v.IsServer ? "*" : ""}${v.Name} [${CommandGroups[v.Group] ?? `Custom<${v.Group}>`}] -${
						v.Arguments.size() > 0
							? " (" +
								(v.Arguments.mapFiltered((v) => `${v.Type}${v.Optional ? "?" : ""}`).join() ?? "") +
								") "
							: ""
					}${v.Description === undefined ? "" : ` ${v.Description.gsub("\n", " ")[0]}`}`,
			),
			page,
			CMDS_PAGE_ELEM_COUNT,
		);
	}
}
