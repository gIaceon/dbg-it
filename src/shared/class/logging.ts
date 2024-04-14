import { ILogEventSink, LogEvent, LogLevel } from "@rbxts/log/out/Core";
import { MessageTemplateParser, PlainTextMessageTemplateRenderer } from "@rbxts/message-templates";

const MESSAGE_HISTORY_MAX = 1000;

export type LoggingMiddleware = (
	severity: LogLevel,
	time: string | undefined,
	message: string,
	event: LogEvent,
) => void;

export class DbgItLoggingSink implements ILogEventSink {
	private history: { severity: LogLevel; time: string | undefined; message: string; event: LogEvent }[] = [];
	private middleware: LoggingMiddleware[];
	constructor(...middleware: LoggingMiddleware[]) {
		this.middleware = middleware;
	}
	Emit(message: LogEvent): void {
		const template = new PlainTextMessageTemplateRenderer(MessageTemplateParser.GetTokens(message.Template));
		const time = DateTime.fromIsoDate(message.Timestamp)?.FormatLocalTime("HH:mm:ss", "en-us");
		const tag = this.getSeverityLabel(message.Level);
		const renderedMessage = template.Render(message);
		const formattedMessage = `[${tag!}]: ${renderedMessage}`;
		this.middleware.forEach((mw) => coroutine.wrap(mw)(message.Level, time, formattedMessage, message));
		this.history.push({
			severity: message.Level,
			time: time,
			message: formattedMessage,
			event: message,
		});
		this.history = this.history.filter(
			(_, i) => this.history.size() > MESSAGE_HISTORY_MAX && i <= this.history.size() - MESSAGE_HISTORY_MAX,
		);
	}
	public getSeverityLabel(level: LogLevel) {
		let tag: string | undefined = undefined;
		switch (level) {
			case LogLevel.Verbose:
				tag = "VERBOSE";
				break;
			case LogLevel.Debugging:
				tag = "DEBUG";
				break;
			case LogLevel.Error:
				tag = "ERROR";
				break;
			case LogLevel.Fatal:
				tag = "FATAL";
				break;
			case LogLevel.Information:
				tag = "INFO";
				break;
			case LogLevel.Warning:
				tag = "WARNING";
				break;
			default:
				tag = "UNKNOWN";
				break;
		}
		return tag;
	}
	public addMiddleware(mw: LoggingMiddleware) {
		this.history.forEach((v) => coroutine.wrap(mw)(v.severity, v.time, v.message, v.event));
		this.middleware.push(mw);
	}
	public getMessageHistory() {
		return this.history;
	}
}
