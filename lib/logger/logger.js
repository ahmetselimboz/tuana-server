const logger = require("./loggerSettings");

let instance = null;
class LoggerClass {
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  #createLogObject(username, location, proc_type, log) {
    return {
      username,
      location,
      proc_type,
      log,
    };
  }

  info(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.info(logs);
  }

  warn(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.warn(logs);
  }

  error(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);

    logger.error(logs);
  }

  verbose(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.verbose(logs);
  }

  silly(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.silly(logs);
  }

  http(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.http(logs);
  }

  debug(username, location, proc_type, log) {
    let logs = this.#createLogObject(username, location, proc_type, log);
    logger.debug(logs);
  }
}


module.exports= new LoggerClass();