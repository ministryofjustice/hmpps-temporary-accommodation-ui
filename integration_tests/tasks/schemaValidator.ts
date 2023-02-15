import { Validator } from 'jsonschema'
import schema from '../../server/form-pages/apply/schema.json'

export default {
  validateBodyAgainstApplySchema: (body: Record<string, unknown>): boolean => {
    const validator = new Validator()
    const result = validator.validate(body, schema)
    return result.valid
  },
}
