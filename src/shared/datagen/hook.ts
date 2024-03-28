import { BaseRegistry } from "../class/regBase";
import { HookInjectPoints } from "../enum";
import { Builder } from "../impl/builder";
import { CommandCtx, HookDef } from "../types";

export type HookFunction = (ctx: CommandCtx) => string | undefined | void;

export class HookBuilder extends Builder<HookDef> {
	public hook: HookFunction = () => `No implementation (${this.definition.HookName ?? "No Hook Name"})`;
	protected constructor(
		private definition: Partial<HookDef>,
		private readonly registry: BaseRegistry,
	) {
		super();
	}
	public setHook(hook: HookFunction) {
		this.hook = hook;
		return this;
	}
	public register() {
		this.registry.registerHook(this);
		return this;
	}
	/** @hidden */
	public build(): HookDef {
		return this.definition as HookDef;
	}
	public static create(injectionPoint: HookInjectPoints, name: string, registry: BaseRegistry) {
		return new HookBuilder(
			{
				InjectionPoint: injectionPoint,
				HookName: name,
			},
			registry,
		);
	}
}
