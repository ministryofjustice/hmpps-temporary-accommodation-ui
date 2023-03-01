/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import CheckYourAnswers from './check-your-answers'
import ReasonsForPlacement from './reasons-for-placement'
import RiskAndNeedFactors from './risk-and-need-factors'

@Form({ sections: [ReasonsForPlacement, RiskAndNeedFactors, CheckYourAnswers] })
export default class Apply extends BaseForm {}
