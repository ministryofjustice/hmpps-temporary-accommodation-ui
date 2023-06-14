import {
  TemporaryAccommodationApplication as Application,
  ApprovedPremisesAssessment as Assessment,
} from '../../@types/shared'

export default (applicationOrAssessment: Application | Assessment): applicationOrAssessment is Assessment => {
  return false
}
