/* istanbul ignore file */
import BaseForm from '../baseForm'
import { Form } from '../utils/decorators'
import CheckYourAnswers from './check-your-answers'
import ExampleSection from './example-section'

@Form({ sections: [ExampleSection, CheckYourAnswers] })
export default class Apply extends BaseForm {}
