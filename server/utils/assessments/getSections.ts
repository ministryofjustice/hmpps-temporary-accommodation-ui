import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '../../@types/shared'
import { FormSections } from '../../@types/ui'
import Apply from '../../form-pages/apply'
import CheckYourAnswers from '../../form-pages/apply/check-your-answers'
import Assess from '../../form-pages/assess'
import isAssessment from './isAssessment'

export default (
  applicationOrAssessment: Application | Assessment,
  excludeCheckYourAnswers: boolean = false,
): FormSections => {
  const sections = isAssessment(applicationOrAssessment) ? Assess.sections : Apply.sections

  return excludeCheckYourAnswers ? sections.filter(section => section.name !== CheckYourAnswers.name) : sections
}
