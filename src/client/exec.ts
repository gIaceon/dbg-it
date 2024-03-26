import { DbgIt } from "../shared";
import { BaseExec } from "../shared/class/exec";

export class ExecClient extends BaseExec {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
	public async execute(commandString: string) {
		return super.execute(commandString, game.GetService("Players").LocalPlayer);
	}
}
