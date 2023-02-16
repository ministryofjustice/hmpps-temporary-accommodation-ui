/* istanbul ignore file */

import Review from './review'
import { Task, Section } from '../../utils/decorators'

@Task({
  name: 'Check your answers',
  slug: 'check-your-answers',
  pages: [Review],
})
@Section({
  title: 'Check your answers',
  tasks: [CheckYourAnswers],
})
export default class CheckYourAnswers {}
