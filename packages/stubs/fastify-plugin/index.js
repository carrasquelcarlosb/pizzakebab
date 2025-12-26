function fastifyPlugin(fn) {
  const wrapped = async function pluginWrapper(instance, opts) {
    return fn(instance, opts ?? {});
  };
  return wrapped;
}

module.exports = fastifyPlugin;
module.exports.default = fastifyPlugin;
