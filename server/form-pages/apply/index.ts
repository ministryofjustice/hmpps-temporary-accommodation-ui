/* istanbul ignore file */
import { Form } from '../utils/decorators'
import BaseForm from '../baseForm'
import ExampleSection from './example-page'
import CheckYourAnswers from './check-your-answers'

@Form({ sections: [ExampleSection, CheckYourAnswers] })
export default class Apply extends BaseForm {}
