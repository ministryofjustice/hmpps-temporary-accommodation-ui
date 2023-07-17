/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import AccommodationNeed from './accommodation-need'
import AssessRisksForPlacement from './assess-risks-for-placement'
import CheckYourAnswers from './check-your-answers'
import PlacementConsiderations from './placement-considerations'
import RequiredReferrals from './required-referrals'

@Form({
  sections: [AccommodationNeed, AssessRisksForPlacement, PlacementConsiderations, RequiredReferrals, CheckYourAnswers],
})
export default class Apply extends BaseForm {}
