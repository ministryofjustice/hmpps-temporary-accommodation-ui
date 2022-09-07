/* istanbul ignore file */

import EnterCRN from './enterCrn'
import ConfirmDetails from './confirmDetails'
import SentenceType from './sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'

const pages = {
  'enter-crn': EnterCRN,
  'confirm-details': ConfirmDetails,
  'sentence-type': SentenceType,
  'release-type': ReleaseType,
  situation: Situation,
}

export default pages
