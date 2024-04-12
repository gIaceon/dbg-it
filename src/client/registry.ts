import { DbgIt } from "../shared";
import { BaseRegistry } from "../shared/class/registry";

export class ClientRegistry extends BaseRegistry {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
}
