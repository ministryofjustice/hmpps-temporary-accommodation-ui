/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AlternativePdu from './alternativePdu'
import AlternativePduReason from './alternativePduReason'
import AlternativeRegion from './alternativeRegion'
import DifferentRegion from './differentRegion'
import PlacementPdu from './placementPdu'
import ApprovedPdu from './approvedPdu'
@Task({
  name: 'Placement location',
  actionText: 'Confirm placement location',
  slug: 'placement-location',
  pages: [AlternativeRegion, AlternativePdu, AlternativePduReason, DifferentRegion, PlacementPdu, ApprovedPdu],
})
export default class PlacementLocation {}
