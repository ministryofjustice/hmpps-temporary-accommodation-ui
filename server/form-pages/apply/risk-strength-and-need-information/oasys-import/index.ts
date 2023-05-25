import { Task } from '../../../utils/decorators'
import OffenceDetails from './offenceDetails'
import OptionalOasysSections from './optionalOasysSections'
import RiskManagementPlan from './riskManagementPlan'
import RiskToSelf from './riskToSelf'
import RoshSummary from './roshSummary'
import SupportingInformation from './supportingInformation'

@Task({
  slug: 'oasys-import',
  name: 'OASys information',
  pages: [OptionalOasysSections, RoshSummary, OffenceDetails, SupportingInformation, RiskManagementPlan, RiskToSelf],
})
export default class OasysImport {}
