/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import AccommodationNeed from './accommodation-need'
import CheckYourAnswers from './check-your-answers'
import PlacementConsiderations from './placement-considerations'
import RequiredReferrals from './required-referrals'
import RiskStrengthAndNeedInformation from './risk-strength-and-need-information'

@Form({
  sections: [
    AccommodationNeed,
    RiskStrengthAndNeedInformation,
    PlacementConsiderations,
    RequiredReferrals,
    CheckYourAnswers,
  ],
})
export default class Apply extends BaseForm {}
