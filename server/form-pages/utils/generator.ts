/* istanbul ignore file */
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

import { camelCase, pascalCase } from '../../utils/utils'

import pageTemplate from './templates/page'
import testTemplate from './templates/test'
import indexTemplate from './templates/index'
import viewTemplate from './templates/view'
import pageObjectTemplate from './templates/pageObject'

const args = process.argv.slice(2)
const pagePath = args[0]

if (!pagePath) {
  console.error('You must specify a path for a page (i.e apply/basic-information/page)')
  process.exit(1)
}

const [formName, sectionName, pageName] = pagePath.split('/')

const dirName = pagePath.replace(pageName, '')

let newSection = false

if (!pageName) {
  console.error('You must specify a path for a page (i.e apply/basic-information/page)')
  process.exit(1)
}

// Create the class directory if it doesn't exist
if (!fs.existsSync(path.resolve(__dirname, '..', dirName))) {
  fs.mkdirSync(`${__dirname}/../${dirName}`)
  newSection = true
}

// Create Page Definition
const pageClassName = pascalCase(pageName)
const pageClassPath = path.resolve(__dirname, `../${formName}/${sectionName}/${camelCase(pageClassName)}.ts`)
const pageClassTestPath = path.resolve(__dirname, `../${formName}/${sectionName}/${camelCase(pageClassName)}.test.ts`)

fs.writeFileSync(pageClassPath, pageTemplate(pageClassName, pageName), {
  flag: 'w+',
})

// Create test file for Page Definition
fs.writeFileSync(pageClassTestPath, testTemplate(pageClassName, camelCase(pageName)), {
  flag: 'w+',
})

const indexPath = path.resolve(__dirname, `../${dirName}/index.ts`)

// Add Page Definition to index file
if (!newSection) {
  const indexFile = fs.readFileSync(indexPath, 'utf8')

  const importLine = `import ${pageClassName} from './${camelCase(pageName)}'`
  const pageDefLine = `  '${pageName}': ${pageClassName},`

  if (!indexFile.includes(importLine) || !indexFile.includes(pageDefLine)) {
    const lines = indexFile.split(/\r?\n/)
    let importAdded = false

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i]

      if (!importAdded && line.startsWith('import') && !lines[i + 1].startsWith('import')) {
        lines.splice(i + 1, 0, importLine)
        importAdded = true
      }

      if (line.startsWith('}')) {
        lines.splice(i, 0, pageDefLine)
        break
      }
    }

    fs.writeFileSync(indexPath, lines.join('\n'), {
      flag: 'w+',
    })
  }
} else {
  fs.writeFileSync(indexPath, indexTemplate(pageClassName, pageName), {
    flag: 'w+',
  })

  const formIndexPath = path.resolve(__dirname, `../${dirName}/../index.ts`)
  let formIndexFileContent = fs.readFileSync(formIndexPath, 'utf8')

  const toDoComment = `// TODO: Add reference to ${sectionName} section`

  formIndexFileContent = `${toDoComment}\r\n${formIndexFileContent}`

  fs.writeFileSync(formIndexPath, formIndexFileContent, {
    flag: 'w+',
  })
}

// Create template file
const viewDir = path.resolve(__dirname, `../../views/applications/pages/${sectionName}`)

if (!fs.existsSync(viewDir)) {
  fs.mkdirSync(viewDir)
}

const viewPath = `${viewDir}/${pageName}.njk`

fs.writeFileSync(viewPath, viewTemplate(), {
  flag: 'w+',
})

// Create Page Object file
const pageObjectPath = path.resolve(__dirname, `../../../cypress_shared/pages/${formName}/${camelCase(pageName)}.ts`)

fs.writeFileSync(pageObjectPath, pageObjectTemplate(pascalCase(pageName)), {
  flag: 'w+',
})

console.log('Form page files successfully generated:')

console.log(pageClassPath)
console.log(pageClassTestPath)
console.log(viewPath)
console.log(pageObjectPath)
