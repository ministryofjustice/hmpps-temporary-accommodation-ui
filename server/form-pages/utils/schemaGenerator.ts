import 'reflect-metadata'

import fs from 'fs'
import path from 'path'
import * as TJS from 'typescript-json-schema'

export default class SchemaGenerator {
  program = TJS.programFromConfig(path.resolve(__dirname, '..', '..', '..', 'tsconfig.json'))

  schemaGeneratorSettings: TJS.PartialArgs = {
    required: false,
    ref: false,
  }

  generator: TJS.JsonSchemaGenerator

  constructor(private readonly filePath: string) {
    /* istanbul ignore next */
    // eslint-disable-next-line no-console
    console.warn = () => {
      return null // Silence warnings
    }
    this.generator = TJS.buildGenerator(this.program, this.schemaGeneratorSettings)
  }

  run<T>(pages: T) {
    const pageKeys = Object.keys(pages)

    const schema = {
      $schema: 'https://json-schema.org/draft/2019-09/schema',
      type: 'object',
      title: 'Apply Schema',
      additionalProperties: false,
      required: Object.keys(pages),
      properties: {},
    }

    pageKeys.forEach(key => {
      const properties = {}

      Object.keys(pages[key]).forEach((k: string) => {
        properties[k] = this.getSchemaForPage(pages[key][k])
      })

      schema.properties[key] = { type: 'object', properties }
    })

    fs.writeFileSync(this.filePath, JSON.stringify(schema, null, 2), {
      flag: 'w+',
    })
  }

  static run<T>(pages: T, filePath: string) {
    const generator = new SchemaGenerator(filePath)
    generator.run(pages)
  }

  getSchemaForPage = (page: unknown) => {
    const className = Reflect.getMetadata('page:className', page)

    const s = this.generator.getSchemaForSymbol(className)

    return s.properties.body
  }
}
