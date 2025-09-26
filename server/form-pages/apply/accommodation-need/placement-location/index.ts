/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AlternativePdu from './alternativePdu'
import AlternativePduReason from './alternativePduReason'
import AlternativeRegion from './alternativeRegion'
import DifferentRegion from './differentRegion'
import PlacementPdu from './placementPdu'
import NeedsEvidence from './needsEvidence'
import PduEvidence from './pduEvidence'

@Task({
  name: 'Placement location',
  actionText: 'Confirm placement location',
  slug: 'placement-location',
  pages: [
    AlternativeRegion,
    AlternativePdu,
    AlternativePduReason,
    DifferentRegion,
    NeedsEvidence,
    PduEvidence,
    PlacementPdu,
  ],
})
export default class PlacementLocation {}
