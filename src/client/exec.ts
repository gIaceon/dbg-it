import { DbgIt } from "../shared";
import { BaseExec } from "../shared/class/exec";
import { remotes } from "../shared/remotes";
import { splitString } from "../shared/util/str";
import { ClientReplicator } from "./replicator";

export class ExecClient extends BaseExec {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
	}
	public execute(commandString: string): ReturnType<BaseExec["execute"]> {
		return new Promise((resolve, reject) => {
			// Replace all inline commands so the server doesn't try to execute client commands
			let possibleErr: string | undefined;
			const inlineResults: Record<string, string> = {};
			for (const tup of string.gmatch(commandString, "$(%b{})")) {
				let result = "";
				const [txt] = tup;
				if (typeIs(txt, "number")) continue;
				this.execute(txt.sub(2, txt.size() - 1))
					.then((res) => (result = res === undefined ? "" : res))
					.catch((err) => (possibleErr = `Inline command failed: ${err}`))
					.await();
				if (result.find("%s").size() > 0) result = `"${result}"`;
				inlineResults[txt] = result;
			}
			if (possibleErr !== undefined) return reject(possibleErr);
			[commandString] = string.gsub(commandString, "$(%b{})", inlineResults);
			const tokens = splitString(commandString, "%s");
			const commandName = tokens[0];
			// If there is no command registered with that name and we have a replicated command with that name...
			if (
				this.dbgit.registry.getCommands().has(commandName) === false &&
				(this.dbgit.replicator as ClientReplicator).commandExists(commandName)
			) {
				const { success, result } = remotes.executeCommand(commandString).expect();
				if (!success) reject(tostring(result ?? "Remote execution failed"));
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
