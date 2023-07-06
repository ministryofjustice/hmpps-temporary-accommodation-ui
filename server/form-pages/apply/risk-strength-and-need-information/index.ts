import { Section } from '../../utils/decorators'
import ApprovalsForSpecificRisksTask from './approvals-for-specific-risks'
import LicenceConditions from './licence-conditions'
import OasysImport from './oasys-import'
import PrisonInformation from './prison-information'

@Section({
  title: 'Risk, strength and need information',
  tasks: [LicenceConditions, PrisonInformation, ApprovalsForSpecificRisksTask, OasysImport],
})
export default class RiskStrengthAndNeedInformation {}
