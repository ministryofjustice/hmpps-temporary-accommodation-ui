import fs from 'fs'

import SchemaGenerator from './schemaGenerator'

type SomeComplexType = {
  id: number
  string: string
  enum: 'some' | 'enum' | 'values'
}

class Page {
  body: {
    foo: string
    bar: SomeComplexType
  }
}

describe('schemaGenerator', () => {
  describe('run', () => {
    it('generates a schema with the correct types', () => {
      const fileSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        return null
      })

      const pages = { section: { page: Page } }

      jest.spyOn(Reflect, 'getMetadata').mockReturnValue('Page')

      SchemaGenerator.run(pages, 'schema.json')

      expect(fs.writeFileSync).toHaveBeenCalledWith('schema.json', expect.anything(), { flag: 'w+' })

      const generatedSchema = JSON.parse(fileSpy.mock.calls[0][1] as string)

      expect(generatedSchema.required).toEqual(['section'])

      expect(Object.keys(generatedSchema.properties)).toEqual(['section'])
      expect(Object.keys(generatedSchema.properties.section.properties)).toEqual(['page'])

      const pageSchema = generatedSchema.properties.section.properties.page
      expect(Object.keys(pageSchema.properties)).toEqual(['foo', 'bar'])

      expect(pageSchema.properties.foo).toEqual({
        type: 'string',
      })

      expect(pageSchema.properties.bar).toEqual({
        type: 'object',
        properties: {
          id: {
            type: 'number',
          },
          string: {
            type: 'string',
          },
          enum: {
            enum: ['enum', 'some', 'values'],
            type: 'string',
          },
        },
      })
    })
  })
})
