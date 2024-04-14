import { CommandCtx } from "../types";

/**
 * A utility class to safely convert data (usually strings) into another type.
 * @abstract
 */
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
