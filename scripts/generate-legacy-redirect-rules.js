/**
 * Goes over the post data to generate the new redirect rules
 * e.g. /posts/foo_bar_baz => /posts/foo-bar-baz
 */
const { safeDump, safeLoad } = require('js-yaml')
const { slugify } = require('jekyll-utils')
const path = require('path')
const sh = require('shelljs')

sh.set('-e')
sh.cd(path.resolve(__dirname, '..'))
sh.mkdir('-p', 'data')

const postFolders = sh.ls('posts')
  .filter(value => !sh.test('-d', value))
  .map(postFolder => path.join('posts', postFolder, 'metadata.yaml'))
  .map(postMetaPath => safeLoad(sh.cat(postMetaPath)))
  .filter(postMeta => postMeta.legacyName)
  .map(({ id, legacyName }) => ({
      destination: path.join('posts', id),
      source: path.join('posts', legacyName),
      type: 301
    })
  )
  .reduce((list, rule) => list.concat(rule), [])

const redirectText = safeDump(postFolders)
sh.ShellString(redirectText).to('data/generated-legacy-redirect-rules.yaml')
