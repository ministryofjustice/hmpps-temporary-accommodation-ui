/* istanbul ignore file */

import path from 'path'

import SchemaGenerator from '../utils/schemaGenerator'

import Apply from '.'

SchemaGenerator.run(Apply.pages, path.resolve(__dirname, 'schema.json'))
