import { Section } from '../../utils/decorators'
import ApprovalsForSpecificRisksTask from './approvals-for-specific-risks'
import BehaviourInCas from './behaviour-in-cas'
import LicenceConditions from './licence-conditions'
import PlacementConsiderations from './placement-considerations'
import PrisonInformation from './prison-information'

@Section({
  title: 'Assess placement risks and needs',
  tasks: [LicenceConditions, PrisonInformation, ApprovalsForSpecificRisksTask, PlacementConsiderations, BehaviourInCas],
})
export default class AssessPlacementRisksAndNeeds {}
