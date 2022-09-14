/* istanbul ignore file */

import SentenceType from './sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'
import ReleaseDate from './releaseDate'
import OralHearing from './oralHearing'
import PlacementDate from './placementDate'

const pages = {
  'sentence-type': SentenceType,
  'release-type': ReleaseType,
  situation: Situation,
  'release-date': ReleaseDate,
  'oral-hearing': OralHearing,
  'placement-date': PlacementDate,
}

export default pages
