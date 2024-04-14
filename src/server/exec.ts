import { DbgIt } from "../shared";
import { BaseExec } from "../shared/class/exec";
import { remotes } from "../shared/remotes";

/**
 * Handles execution of commands.
 */
export class ExecServer extends BaseExec {
	public constructor(dbgit: DbgIt) {
		super(dbgit);
		remotes.executeCommand.onRequest((player, command) => {
			let done = false;
			let result: string | undefined = undefined;

			this.execute(command, player)
				.andThen((r) => {
					done = true;
					result = r as never;
				})
				.catch((err) => {
					done = false;
					result = err;
				})
				.await();

			return {
				success: done,
				result: result,
			};
		});
	}
}
