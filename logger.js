module.exports = {
  config: {
    showDebugLogs: true,
    showStacktraces: true,
    showTimers: true,
  },

  configure(config) {
    this.config = config;
  },

  log(...args) {
    console.log.apply(this, args);
  },

  warn(...args) {
    console.warn.apply(this, args);
  },

  /**
   * Logs an error with the given prefix.
   */
  error(prefix, error) {
    console.error(`${prefix}${this.config.showStacktraces ? error.stack : error.message}`);

    while (error.innerError) {
      error = error.innerError;
      console.group();
      console.error(`Caused by: ${this.config.showStacktraces ? error.stack : error.message}`);
      console.groupEnd();
    }
  },

  /**
   * Logs a variable.
   */
  debug(variable) {
    if (this.config.showDebugLogs) console.dir(variable);
  },

  /**
   * Creates a timer with the given `name`.
   * @param {String} name
   * @returns the label of the timer
   */
  time(name) {
    if (this.config.showTimers) {
      const now = new Date();
      const label = `[TIMER] ${name} (${now.toLocaleTimeString()}.${now.getMilliseconds()}) #${1000 + Math.floor(Math.random() * 9000)}`;
      console.time(label);
      return label;
    }
  },

  /**
   * Ends the timer with the given label and logs its time.
   * @param {String} label
   */
  timeEnd(label) {
    if (this.config.showTimers) console.timeEnd(label);
  },

};
