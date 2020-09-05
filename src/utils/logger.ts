interface ILogger {
  info(message: any, ...data: any[]): void;
  error(message: any, ...data: any[]): void;
  debug(message: any, ...data: any[]): void;
}

class Logger implements ILogger {
  public info(message: any, ...data: any[]) {
    console.info('[info]', message, ...data);
  }

  public error(message: any, ...data: any[]) {
    console.error('[error]', message, ...data);
  }

  public debug(message: any, ...data: any[]) {
    console.log('[debug]', message, ...data);
  }
}

export default new Logger();
