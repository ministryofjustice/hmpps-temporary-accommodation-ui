/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import AccommodationNeed from './accommodation-need'
import AssessRisksForPlacement from './assess-risks-for-placement'
import CheckYourAnswers from './check-your-answers'
import RequiredReferrals from './required-referrals'
import RequirementsForPlacement from './requirements-for-placement'

@Form({
  sections: [AccommodationNeed, AssessRisksForPlacement, RequirementsForPlacement, RequiredReferrals, CheckYourAnswers],
})
export default class Apply extends BaseForm {}
