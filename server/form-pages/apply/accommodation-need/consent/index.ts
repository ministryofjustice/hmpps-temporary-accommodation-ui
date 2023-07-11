/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ConsentGiven from './consentGiven'

@Task({
  name: 'Consent',
  actionText: 'Confirm consent',
  slug: 'consent',
  pages: [ConsentGiven],
})
export default class Consent {}
