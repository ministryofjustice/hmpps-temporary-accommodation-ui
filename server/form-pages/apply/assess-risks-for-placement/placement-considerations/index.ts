/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AccommodationSharing from './accommodationSharing'
import AntiSocialBehaviour from './antiSocialBehaviour'
import Cooperation from './cooperation'
import RiskManagementPlan from './riskManagementPlan'
import RoshLevel from './roshLevel'
import SubstanceMisuse from './substanceMisuse'

@Task({
  name: 'Placement considerations',
  actionText: 'Enter placement considerations',
  slug: 'placement-considerations',
  pages: [AccommodationSharing, Cooperation, AntiSocialBehaviour, SubstanceMisuse, RoshLevel, RiskManagementPlan],
})
export default class PlacementConsiderations {}
