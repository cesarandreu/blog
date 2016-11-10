module.exports = {
  get compileMarkdown () {
    return require('./compile-markdown')
  },
  get redirectRules () {
    return require('./redirect-rules')
  }
}
