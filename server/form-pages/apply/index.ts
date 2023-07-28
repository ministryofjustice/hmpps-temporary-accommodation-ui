/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import AccommodationNeed from './accommodation-need'
import AssessPlacementRisksAndNeeds from './assess-placement-risks-and-needs'
import CheckYourAnswers from './check-your-answers'
import RequiredReferrals from './required-referrals'
import RequirementsForPlacement from './requirements-for-placement'

@Form({
  sections: [
    AccommodationNeed,
    AssessPlacementRisksAndNeeds,
    RequirementsForPlacement,
    RequiredReferrals,
    CheckYourAnswers,
  ],
})
export default class Apply extends BaseForm {}
