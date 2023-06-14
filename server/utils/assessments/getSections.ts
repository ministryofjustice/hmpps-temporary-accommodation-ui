import {
  TemporaryAccommodationApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '../../@types/shared'
import { FormSections } from '../../@types/ui'
import Apply from '../../form-pages/apply'
import Assess from '../../form-pages/assess'
import isAssessment from './isAssessment'

export default (applicationOrAssessment: Application | Assessment): FormSections => {
  return isAssessment(applicationOrAssessment) ? Assess.sections : Apply.sections
}
