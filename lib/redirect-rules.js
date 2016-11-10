const fs = require('fs')
const yaml = require('js-yaml')
module.exports = yaml.safeLoad(fs.readFileSync('../data/redirect-rules.yaml', 'utf8'))
