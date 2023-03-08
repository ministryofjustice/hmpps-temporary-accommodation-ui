import { Task } from '../../../utils/decorators'
import OptionalOasysSections from './optionalOasysSections'

@Task({
  slug: 'oasys-import',
  name: 'Choose sections of OASys to import',
  pages: [OptionalOasysSections],
})
export default class OasysImport {}
