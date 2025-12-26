function createLogger(bindings = {}) {
  const logger = {
    bindings,
    info: () => {},
    error: () => {},
    child(childBindings = {}) {
      return createLogger({ ...bindings, ...childBindings });
    },
  };
  return logger;
}

function pino() {
  return createLogger();
}

module.exports = pino;
module.exports.default = pino;
