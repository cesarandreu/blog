/**
 * Copied every folder from the root and moved it into legacy/
 * Then created the posts/ folder and formatted it similar to jekyll
 * The folder pattern is: [yyyy]-[mm]-[dd]-[kebab-case-title]
 * For example: 2014-01-21-first-post
 * Each post has a metadata.yaml file with the following type:
 *  type PostMetadata = {
 *    createdAt: Date
 *    id: string # kebab-case title
 *    legacyName: ?string # camel-case title
 *    tags: string[]
 *    title: string
 *  }
 * Next to the metadata.yaml there's a markdown.md file with the post body
 */
const { safeDump } = require('js-yaml')
const { slugify } = require('jekyll-utils')
const path = require('path')
const sh = require('shelljs')

sh.set('-e')
sh.cd(path.resolve(__dirname, '..'))
sh.mkdir('-p', 'posts')

const folders = sh.ls('legacy')
  .filter(value => !sh.test('-d', value))

for (const folder of folders) {
  const metadataText = sh.cat(`./legacy/${folder}/${folder}.meta.json`)
  const { createdAt, tags, title } = JSON.parse(metadataText)

  const createdAtDate = createdAt.split('T')[0]
  const slug = slugify(title)

  const newFolder = [createdAtDate, slug].join('-')
  sh.mkdir('-p', path.join('posts', newFolder))

  const value = safeDump({
    createdAt: new Date(createdAt),
    title,
    legacyName: folder,
    id: slug,
    tags: tags.sort((a, b) => a.localeCompare(b))
  }, {
    sortKeys: true
  })
  sh.ShellString(value).to(path.join('posts', newFolder, 'metadata.yaml'))

  const markdown = sh.cat(`./legacy/${folder}/${folder}.md`)
  sh.ShellString(markdown).to(path.join('posts', newFolder, 'markdown.md'))
}
