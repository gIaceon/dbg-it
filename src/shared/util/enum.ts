export type someEnum = {
	[name: symbol]: number;
	[idx: number]: string;
};

export function getEnumKeys<T extends someEnum>(enumeration: T): (keyof T)[] {
	const enumKeys: (keyof T)[] = [];
	// eslint-disable-next-line roblox-ts/no-array-pairs
	for (const [k, _] of pairs(enumeration)) {
		if (rawget(enumeration, k) === undefined) continue;
		enumKeys.push(k as never as keyof T);
	}
	return enumKeys;
}
