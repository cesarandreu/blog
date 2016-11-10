const { loadYaml } = require('./helpers')

module.exports = {
  get redirectRules: lazy(() =>
    loadYaml(path.resolve(__dirname, '../data/redirect-rules.yaml'))
  )
}
