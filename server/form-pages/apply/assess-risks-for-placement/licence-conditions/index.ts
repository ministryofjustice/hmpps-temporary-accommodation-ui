/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AdditionalLicenceConditions from './additionalLicenceConditions'

@Task({
  name: 'Licence conditions',
  actionText: 'Enter licence conditions',
  slug: 'licence-conditions',
  pages: [AdditionalLicenceConditions],
})
export default class LicenceConditions {}
