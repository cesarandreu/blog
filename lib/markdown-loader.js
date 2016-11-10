// Webpack loader for blog post markdown
module.exports = function markdownLoader (source) {
  this.cacheable()

  const compileMarkdown = require('./compile-markdown')
  return compileMarkdown(source)
}
