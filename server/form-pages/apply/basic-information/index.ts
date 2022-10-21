/* istanbul ignore file */

import SentenceType from './sentenceType'
import ReleaseType from './releaseType'
import Situation from './situation'
import ReleaseDate from './releaseDate'
import OralHearing from './oralHearing'
import PlacementDate from './placementDate'
import PlacementPurpose from './placementPurpose'

const pages = {
  'sentence-type': SentenceType,
  'release-type': ReleaseType,
  situation: Situation,
  'release-date': ReleaseDate,
  'oral-hearing': OralHearing,
  'placement-date': PlacementDate,
  'placement-purpose': PlacementPurpose,
}

export default pages
