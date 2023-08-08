import {
  TemporaryAccommodationApplication as Application,
  TemporaryAccommodationAssessment as Assessment,
} from '../../@types/shared'

export default (applicationOrAssessment: Application | Assessment): applicationOrAssessment is Assessment => {
  return false
}
