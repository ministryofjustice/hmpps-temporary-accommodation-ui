import { Section } from '../../utils/decorators'
import LicenceConditions from './licence-conditions'
import OasysImport from './oasys-import'

@Section({ title: 'Risk, strength and need information', tasks: [LicenceConditions, OasysImport] })
export default class RiskStrengthAndNeedInformation {}
