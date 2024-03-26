import { t } from "@rbxts/t";
import { Type } from "./class/type";
import { getEnumKeys, someEnum } from "./util/enum";
import { CommandCtx } from "./types";

export class StringType extends Type<string> {
	protected constructor() {
		super("string");
	}
	public transform(value: unknown): string | undefined {
		return tostring(value);
	}
	public validate(value: unknown): value is string {
		return t.string(value);
	}
	public static create() {
		return new StringType();
	}
}

export class NumberType extends Type<number> {
	protected constructor() {
		super("number");
	}
	public transform(value: unknown): number | undefined {
		return tonumber(value);
	}
	public validate(value: unknown): value is number {
		return t.number(value);
	}
	public static create() {
		return new NumberType();
	}
}

abstract class InstanceType<T extends Instance> extends Type<T> {}

export class PlayerType extends InstanceType<Player> {
	public transform(value: unknown, ctx: CommandCtx): Player | undefined {
		if (tostring(value) === "@me") return ctx.Executor;
		return game.GetService("Players").FindFirstChild(tostring(value)) as Player | undefined;
	}
	public validate(value: unknown): value is Player {
		return t.instanceIsA("Player")(value);
	}
	protected constructor() {
		super("player");
	}
	public static create() {
		return new PlayerType();
	}
}

export class EnumType<T extends someEnum> extends Type<T[keyof T]> {
	protected constructor(
		private readonly enumeration: T,
		private readonly enumName: string,
		private readonly enumKeys = getEnumKeys(enumeration),
	) {
		super(enumName);
	}
	public transform(value: unknown): T[keyof T] | undefined {
		// print(this.enumKeys);
		const asStr = tostring(value);
		if (this.enumKeys.includes(asStr as keyof T)) return this.enumeration[asStr as keyof T];
	}
	public validate(value: unknown): value is T[keyof T] {
		return this.enumeration[value as never] !== undefined;
	}
	public static create<T extends someEnum>(enumeration: T, name: string) {
		return new EnumType(enumeration, name);
	}
}
