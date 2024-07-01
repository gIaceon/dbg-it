import { t } from "@rbxts/t";
import { Kind, tKind } from "../kind";

export class StringKind extends tKind<string> {
	public transform(data: string): string {
		return tostring(data);
	}
	public constructor() {
		super("string", t.string);
	}
}

export class NumberKind extends tKind<number> {
	public transform(data: string) {
		return tonumber(data);
	}
	public constructor() {
		super("number", t.number);
	}
}

export class BooleanKind extends tKind<boolean> {
	public transform(data: string) {
		let retrn: boolean | undefined = undefined;
		switch (data) {
			case "1":
			case "on":
			case "true":
				retrn = true;
				break;
			case "0":
			case "off":
			case "false":
				retrn = false;
				break;
			default:
				break;
		}
		return retrn;
	}
	public constructor() {
		super("boolean", t.boolean);
	}
}

export class LiteralKind<T extends string> extends tKind<T> {
	public constructor(public readonly literal: T) {
		super(`"${literal}"`, t.literal(literal));
	}
	public transform(data: string): T | undefined {
		if (this.check(data)) return data;
		return undefined;
	}
}

export class LiteralUnionKind<T extends string[]> extends Kind<T[number]> {
	public readonly literal: T;
	public constructor(...literal: T) {
		super(`[${literal.mapFiltered((v) => `"${v}"`).join(" | ")}]`);
		this.literal = literal;
	}
	public transform(data: string): T[number] | undefined {
		return this.verify(data) ? data : undefined;
	}
	public verify(data: unknown): data is T[number] {
		return this.literal.indexOf(tostring(data)) >= 0;
	}
}
