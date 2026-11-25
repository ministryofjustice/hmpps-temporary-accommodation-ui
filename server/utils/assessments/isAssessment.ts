import { TemporaryAccommodationApplication as Application, Cas3Assessment as Assessment } from '../../@types/shared'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (applicationOrAssessment: Application | Assessment): applicationOrAssessment is Assessment => {
  return false
}
