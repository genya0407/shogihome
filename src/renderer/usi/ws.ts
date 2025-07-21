import { getConsoleLogger, Logger } from "./log";

export class UsiWebsocket {
  private ws: WebSocket;
  private logger: Logger;

  constructor(url: string) {
    this.ws = new WebSocket(url);
    this.logger = getConsoleLogger();
  }

  get pid(): number | undefined {
    return undefined;
  }

  on(event: "receive", listener: (line: string) => void): this;
  on(event: "error", listener: (err: Error) => void): this;
  on(event: "close", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, listener: (...args: any[]) => void): this {
    switch (event) {
      case "receive":
        this.ws.addEventListener("message", (event) => {
          this.logger.debug(`message ${event.data}`);
          listener(event.data);
        });
        break;
      case "close":
        this.ws.addEventListener("close", () => {
          listener(0, null);
        });
        break;
      default:
        // do nothing
        break;
    }
    return this;
  }

  send(line: string): void {
    this.logger.debug(`send ${line}`);

    if (this.ws.readyState !== WebSocket.OPEN) {
      this.ws.addEventListener("open", () => {
        this.ws.send(line + "\n");
      });
    } else {
      this.ws.send(line + "\n");
    }
  }

  kill(): void {
    this.logger.debug(`kill`);

    if (this.ws.readyState !== WebSocket.OPEN) {
      this.ws.addEventListener("open", () => {
        this.ws.close();
      });
    } else {
      this.ws.close();
    }
  }
}
