import { DbgIt } from "../shared";
import { BaseExec } from "../shared/class/exec";
import { remotes } from "../shared/remotes";
import { splitString } from "../shared/util/str";

export class ExecClient extends BaseExec {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
	public execute(commandString: string): ReturnType<BaseExec["execute"]> {
		return new Promise((resolve, reject) => {
			const split = splitString(commandString, "%s");
			const commandName = split[0];
			if (this.dbgit.registry.getCommands().has(commandName) === false) {
				const { success, result } = remotes.executeCommand(commandString).expect();
				if (!success) reject(tostring(result ?? "Unknown error!"));
				return resolve(result);
			}
			let result: string | void | undefined = undefined;
			let doThrow = false;
			super
				.execute(commandString, game.GetService("Players").LocalPlayer)
				.andThen((r) => (result = r))
				.catch((e) => {
					result = e;
					doThrow = true;
				});
			return doThrow ? reject(result) : resolve(result);
		});
	}
}
