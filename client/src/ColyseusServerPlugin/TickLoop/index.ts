export default class TickLoop {
  isRunning = false;

  /**
   * Elapsed ms since last callback execution
   */
  private elapsedTime = 0;

  /**
   * Inverse of tps - Ms per Tick
   */
  readonly targetMSPT = 1000 / this.targetTPS;

  tick = 0;

  constructor(
    readonly targetTPS: number,
    readonly callback: (delta: number, tick: number) => void
  ) {}

  start(resetTickCount: boolean = true) {
    if (this.isRunning) return;
    /**
     * Start running
     */
    if (resetTickCount) this.tick = 0;
    this.isRunning = true;
    this.step();
  }

  private timeoutID: number;
  private step = (lastTimestamp: number = performance.now()) => {
    /** Get Current time */
    const timestamp = performance.now();

    /** Add number of ms since last execution */
    this.elapsedTime += timestamp - lastTimestamp;

    while (this.elapsedTime >= this.targetMSPT) {
      this.elapsedTime -= this.targetMSPT;
      this.callback(this.targetMSPT, this.tick++);
    }

    this.timeoutID = setTimeout(
      this.step,
      this.targetMSPT - this.elapsedTime,
      timestamp
    );
  };

  stop() {
    this.isRunning = false;
    clearTimeout(this.timeoutID);
  }
}
