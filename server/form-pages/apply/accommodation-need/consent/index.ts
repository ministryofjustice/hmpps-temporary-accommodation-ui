/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ConsentDetails from './consentDetails'
import ConsentGiven from './consentGiven'

@Task({
  name: 'Consent',
  actionText: 'Confirm consent',
  slug: 'consent',
  pages: [ConsentGiven, ConsentDetails],
})
export default class Consent {}
