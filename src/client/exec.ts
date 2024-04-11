import { DbgIt } from "../shared";
import { BaseExec } from "../shared/class/exec";
import { remotes } from "../shared/remotes";
import { splitString } from "../shared/util/str";

export class ExecClient extends BaseExec {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
	public async execute(commandString: string) {
		const split = splitString(commandString, "%s");
		const commandName = split[0];
		if (this.dbgit.registry.getCommands().has(commandName) === false) {
			const { success, result } = remotes.executeCommand(commandString).expect();
			if (!success) throw tostring(result ?? "Unknown error!");
			return result;
		}
		return super.execute(commandString, game.GetService("Players").LocalPlayer);
	}
}
