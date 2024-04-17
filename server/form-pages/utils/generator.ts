/* istanbul ignore file */
/* eslint-disable no-console */

import fs from 'fs'
import path from 'path'

import { camelCase, pascalCase, sentenceCase } from '../../utils/utils'

import pageTemplate from './templates/page'
import testTemplate from './templates/test'
import viewTemplate from './templates/view'
import pageObjectTemplate from './templates/pageObject'
import sectionIndexTemplate from './templates/sectionIndex'
import taskIndexTemplate from './templates/taskIndex'

const args = process.argv.slice(2)
const pagePath = args[0]

if (!pagePath) {
  console.error('You must specify a path for a page (i.e apply/basic-information/task-name/page)')
  process.exit(1)
}

const [formName, sectionName, taskName, pageName] = pagePath.split('/')

if (!pageName) {
  console.error('You must specify a path for a page (i.e apply/basic-information/task-name/page)')
  process.exit(1)
}

const formPath = path.resolve(__dirname, '..', formName)
const sectionDir = `${formPath}/${sectionName}`
const sectionIndex = `${sectionDir}/index.ts`
const taskDir = `${formPath}/${sectionName}/${taskName}`
const taskIndex = `${taskDir}/index.ts`

const addImport = (filePath: string, className: string, classPath: string, property: string) => {
  let file = fs.readFileSync(filePath, 'utf8')

  // Add import statement
  const importStatement = `import ${className} from '${classPath}'`

  if (!file.includes(importStatement)) {
    console.log(`Adding import statement for ${className} to ${filePath.replace(formPath, 'apply')}`)
    const lines = file.split(/\r?\n/)

    // Add import line
    const lastImport = [...lines].reverse().find(line => line.match(/^import /))
    lines.splice(lines.indexOf(lastImport) + 1, 0, importStatement)

    file = lines.join('\n')
  }

  // Add className to correct property
  const propertyMatch = file.match(new RegExp(`${property}: (\\[([\\w,\\s]*)\\])`))
  const existingClasses = (propertyMatch[2] || '').replace(/\s*/gm, '').split(',').filter(Boolean)

  if (!existingClasses.includes(className)) {
    console.log(`Adding class ${className} to ${property} property of ${filePath.replace(formPath, 'apply')}`)

    const updatedClasses = [...existingClasses, className].join(', ')

    file = file.replace(propertyMatch[1], `[${updatedClasses}]`)
  }

  fs.writeFileSync(filePath, file, {
    flag: 'w+',
  })
}

// Create the section directory and index if it doesn't exist
if (!fs.existsSync(path.resolve(formPath, sectionName))) {
  console.log(`---\nCreating directory and index for new section ${sectionName}`)
  const sectionClassName = pascalCase(sectionName)
  fs.mkdirSync(sectionDir)
  fs.writeFileSync(sectionIndex, sectionIndexTemplate(sectionClassName, sentenceCase(sectionName)), {
    flag: 'w+',
  })

  // Import the new section in apply/index.ts
  addImport(`${formPath}/index.ts`, sectionClassName, `./${sectionName}`, 'sections')
}

// Create the task directory and index if it doesn't exist
if (!fs.existsSync(path.resolve(formPath, sectionName, taskName))) {
  console.log(`---\nCreating directory and index for new task ${sectionName}/${taskName}`)
  const taskClassName = pascalCase(taskName)
  fs.mkdirSync(taskDir)
  fs.writeFileSync(taskIndex, taskIndexTemplate(taskClassName, taskName, sentenceCase(taskName)), {
    flag: 'w+',
  })

  // Import the new task in apply/section-name/index.ts
  addImport(sectionIndex, taskClassName, `./${taskName}`, 'tasks')
}

// Create Page Definition
console.log('---\nCreating new page')
const pageClassName = pascalCase(pageName)
const pageClassPath = `${taskDir}/${camelCase(pageClassName)}.ts`
const pageClassTestPath = `${taskDir}/${camelCase(pageClassName)}.test.ts`

// Create the new page file
fs.writeFileSync(pageClassPath, pageTemplate(pageClassName, pageName), {
  flag: 'w+',
})

// Create test file for new page
fs.writeFileSync(pageClassTestPath, testTemplate(pageClassName, camelCase(pageName)), {
  flag: 'w+',
})

// Add new page to task index
addImport(taskIndex, pageClassName, `./${camelCase(pageName)}`, 'pages')

// Create template file
const viewDir = path.resolve(__dirname, `../../views/applications/pages/${sectionName}/${taskName}`)

if (!fs.existsSync(viewDir)) {
  console.log(`---\nCreating view directory views/applications/pages/${sectionName}/${taskName}`)
  fs.mkdirSync(viewDir, { recursive: true })
}

const viewPath = `${viewDir}/${pageName}.njk`

fs.writeFileSync(viewPath, viewTemplate(), {
  flag: 'w+',
})

// Create Page Object file
const pageObjectDir = path.resolve(__dirname, `../../../cypress_shared/pages/${formName}/${sectionName}/${taskName}`)
if (!fs.existsSync(pageObjectDir)) {
  console.log(`---\nCreating page object directory cypress_shared/pages/${formName}/${sectionName}/${taskName}`)
  fs.mkdirSync(pageObjectDir, { recursive: true })
}

const pageObjectPath = `${pageObjectDir}/${camelCase(pageName)}.ts`
fs.writeFileSync(pageObjectPath, pageObjectTemplate(pascalCase(pageName), pageName, taskName), {
  flag: 'w+',
})

console.log('\n=========\n\nForm page files successfully generated:\n')

console.log(pageClassPath)
console.log(pageClassTestPath)
console.log(viewPath)
console.log(pageObjectPath)
