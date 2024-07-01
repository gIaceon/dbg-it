const GAME_NAME = `@!_${game.Name}_!`;

export class CommandExecutor {
	public constructor(public readonly player: Player | undefined) {}

	public name() {
		return `${this.player?.Name ?? GAME_NAME}`;
	}
}
