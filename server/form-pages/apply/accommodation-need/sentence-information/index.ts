/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import OffendingSummary from './offendingSummary'
import ReleaseType from './releaseType'
import SentenceExpiry from './sentenceExpiry'
import SentenceType from './sentenceType'

@Task({
  name: 'Sentence information',
  actionText: 'Add sentence information',
  slug: 'sentence-information',
  pages: [OffendingSummary, SentenceType, SentenceExpiry, ReleaseType],
})
export default class SentenceInformation {}
