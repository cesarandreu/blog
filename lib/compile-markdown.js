// Compile blog post markdown into html
const marked = require('marked')

function highlight (code, lang) {
  const Prism = require('prismjs')
  if (!Prism.languages[lang]) {
    require(`prismjs/components/prism-${lang}`)
  }
  return Prism.highlight(code.trim(), Prism.languages[lang], lang).trim()
}

const renderer = new marked.Renderer()
renderer.heading = function heading (text, level) {
  // Strip all level 1 heading
  if (level === 1) {
    return ''
  }

  const he = require('he')
  const { slugify } = require('jekyll-utils')
  const { h } = require('preact')
  const renderHtml = require('preact-render-to-string')

  // Add a link after other heading elements
  const headingText = he.decode(text)
  const id = slugify(headingText)
  return renderHtml(
    h(`h${level}`, null,
      h('a', { href: `#${id}`, id }),
      h('span', null, headingText)
    )
  ) + '\n'
}

const options = {
  breaks: false,
  gfm: true,
  highlight,
  pedantic: false,
  renderer,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  tables: true
}

module.exports = function compileMarkdown (markdown) {
  return new Promise((resolve) => resolve(marked(markdown, options)))
}
