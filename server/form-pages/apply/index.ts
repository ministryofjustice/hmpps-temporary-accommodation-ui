/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import AccommodationNeed from './accommodation-need'
import AssessPlacementRisksAndNeeds from './assess-placement-risks-and-needs'
import CheckYourAnswers from './check-your-answers'
import RequiredReferrals from './required-referrals'
import HealthDisabilityCultureAndSafeguarding  from './requirements-for-placement'

@Form({
  sections: [
    AccommodationNeed,
    AssessPlacementRisksAndNeeds,
    HealthDisabilityCultureAndSafeguarding,
    RequiredReferrals,
    CheckYourAnswers,
  ],
})
export default class Apply extends BaseForm {}
