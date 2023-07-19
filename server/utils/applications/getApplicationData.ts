import {
  TemporaryAccommodationApplication as Application,
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../../@types/shared'
import { arrivalDateFromApplication } from '../../form-pages/utils'

export const getApplicationUpdateData = (application: Application): UpdateApplication => {
  return {
    data: application.data,
    type: 'CAS3',
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApplication => {
  return {
    translatedDocument: application.document,
    type: 'CAS3',
    arrivalDate: arrivalDateFromApplication(application),
  }
}
