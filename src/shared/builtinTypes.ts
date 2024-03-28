import { t } from "@rbxts/t";
import { Type } from "./class/type";
import { getEnumKeys, someEnum } from "./util/enum";
import { CommandCtx } from "./types";
import { splitString } from "./util/str";

/**
 * Type which has values seperated by commas.
 */
export abstract class CSVType<T, K extends Type<T> = Type<T>> extends Type<T[]> {
	protected abstract baseType: K;
	protected abstract check: t.check<T>;
	/**
	 * Takes `value` and turns it into an array of strings seperated by commas.
	 * @param value The value passed into `transform`.
	 * @returns An array which is `value` as a string seperated by commas.
	 */
	public generateCSV(value: unknown): string[] {
		return splitString(tostring(value), ",");
	}
	public transform(value: unknown, ctx: CommandCtx): T[] | undefined {
		return this.generateCSV(value).mapFiltered((v) => this.baseType.transform(v, ctx));
	}
	public validate(value: unknown): value is T[] {
		return t.array(this.check)(value);
	}
}

export class StringType extends Type<string> {
	public transform(value: unknown): string | undefined {
		return tostring(value);
	}
	public validate(value: unknown): value is string {
		return t.string(value);
	}
	public static create() {
		return new StringType("string");
	}
}

export class StringsType extends CSVType<string> {
	protected baseType = StringType.create();
	protected check = t.string;
	public static create() {
		return new StringsType("strings");
	}
}

export class NumberType extends Type<number> {
	public transform(value: unknown): number | undefined {
		return tonumber(value);
	}
	public validate(value: unknown): value is number {
		return t.number(value);
	}
	public static create() {
		return new NumberType("number");
	}
}

export class NumbersType extends CSVType<number> {
	protected baseType = NumberType.create();
	protected check = t.number;
	public static create() {
		return new NumbersType("numbers");
	}
}

export class BooleanType extends Type<boolean> {
	protected trueStrings: string[] = ["true", "yes", "on", "1"];
	protected falseStrings: string[] = ["false", "no", "off", "0"];
	public transform(value: unknown, ctx: CommandCtx): boolean | undefined {
		const valueStr = tostring(value).lower();
		if (this.trueStrings.includes(valueStr)) return true;
		if (this.falseStrings.includes(valueStr)) return false;
		return undefined;
	}
	public validate(value: unknown): value is boolean {
		return t.boolean(value);
	}
	public static create() {
		return new BooleanType("boolean");
	}
}

export class BooleansType extends CSVType<boolean> {
	protected baseType = BooleanType.create();
	protected check = t.boolean;
	public static create() {
		return new BooleansType("booleans");
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
	public static create() {
		return new PlayerType("player");
	}
}

export class PlayersType extends CSVType<Player> {
	protected baseType = PlayerType.create();
	protected check = t.instanceIsA("Player");
	public static create() {
		return new PlayersType("players");
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

export class EnumsType<T extends someEnum> extends CSVType<T[keyof T]> {
	protected baseType: Type<T[keyof T]>;
	protected check: t.check<T[keyof T]>;
	protected constructor(
		private readonly enumeration: T,
		private readonly enumName: string,
		private readonly enumKeys = getEnumKeys(enumeration),
	) {
		super(enumName);
		this.baseType = EnumType.create(enumeration, enumName);
		this.check = t.keys(t.literal(enumKeys)) as never;
	}
	public static create<T extends someEnum>(enumeration: T, name: string) {
		return new EnumsType(enumeration, name);
	}
}
