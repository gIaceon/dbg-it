import { t } from "@rbxts/t";
import { CommandCtx } from "../types";

/** Base class to convert a token into an argument */
export abstract class Type<S> {
	protected constructor(private name: string) {}
	public abstract transform(value: unknown, ctx: CommandCtx): S | undefined;
	public abstract validate(value: unknown): value is S;
	public getName() {
		return this.name;
	}
	public toString() {
		return `TYPE-${this.name}`;
	}
}
