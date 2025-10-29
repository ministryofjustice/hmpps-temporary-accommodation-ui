import { TemporaryAccommodationApplication as Application, Cas3Assessment as Assessment } from '../../@types/shared'

export default (applicationOrAssessment: Application | Assessment): applicationOrAssessment is Assessment => {
  return false
}
