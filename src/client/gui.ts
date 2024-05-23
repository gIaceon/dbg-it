import Iris from "@rbxts/iris";
import { ContextActionService } from "@rbxts/services";
import { DbgItClient } from ".";
import { toStr } from "../shared/impl/tostr";

class IDbgItGui implements toStr {
	protected _shown = Iris.State(false);
	protected _logs: string[] = [];
	protected _mutex = Iris.State(false);
	protected _cmd = Iris.State("");

	public constructor(
		protected readonly props: Props,
		private readonly dbgit: typeof DbgItClient,
	) {
		if (props.initIris) Iris.Init();
		Iris.Connect(() => {
			Iris.Window(["Dbg-It!", false, false, false, true], { isOpened: this._shown });
			// Executor
			Iris.SameLine([]);
			Iris.InputText(["", "Input command..."], { text: this._cmd });
			if (Iris.Button(["Execute"]).clicked()) task.spawn(() => this.attemptExecuteCmd());
			Iris.End();

			Iris.Indent([]);
			Iris.End();

			Iris.CollapsingHeader(["Logs"]);
			this._logs.filter((v, i) => i >= this._logs.size() - 50).forEach((v) => Iris.Text([v]));
			Iris.End();

			Iris.End();
		});
		ContextActionService.BindActionAtPriority(
			"__DBG-IT!__GUI__",
			(_, state) => {
				if (state !== Enum.UserInputState.Begin) return;
				this.toggle();
			},
			false,
			Enum.ContextActionPriority.High.Value,
			...this.props.keybinds,
		);
		DbgItClient.LogSink.addMiddleware(
			(_severity, time, message) => (this._logs = [...this._logs, `${time} - ${message}`]),
		);
	}

	protected attemptExecuteCmd(str: string = this._cmd.get()) {
		if (this._mutex.get()) return;
		this._mutex.set(true);
		this.dbgit.executor
			.execute(str)
			.andThen((v) => (v !== undefined ? this.dbgit.Logger.Info(v) : undefined))
			.catch((err) => this.dbgit.Logger.Error(err))
			.await();
		this._mutex.set(false);
	}

	public show() {
		this._shown.set(true);
		return this;
	}

	public hide() {
		this._shown.set(false);
		return this;
	}

	public toggle() {
		return this.isShown() ? this.show() : this.hide();
	}

	public isShown() {
		return this._shown;
	}

	public toString(): string {
		return "DbgIt-UI";
	}
}

const DefaultProps: Props = {
	keybinds: [],
	initIris: true,
};

export function DbgItGui(props: Partial<Props>, dbgit: typeof DbgItClient): IGui {
	return new IDbgItGui({ ...DefaultProps, ...props }, dbgit);
}

export type IGui = IDbgItGui;
export interface Props {
	keybinds: (Enum.KeyCode | Enum.UserInputType | Enum.PlayerActions)[];
	initIris: boolean;
}
