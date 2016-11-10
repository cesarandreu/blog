const lazyCache = new Map()
function lazy (get) {
  const key = Symbol()
  return () => {
    if (!lazyCache.has(key)) {
      lazyCache.set(key, get())
    }
    return lazyCache.get(key)
  }
}

function loadYaml (file) {
  const yaml = require('js-yaml')
  return yaml.safeLoad(fs.readFileSync(file, 'utf8'))
}

module.exports = {
  lazy,
  loadYaml
}
