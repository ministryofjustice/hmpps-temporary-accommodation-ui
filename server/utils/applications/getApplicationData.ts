import {
  TemporaryAccommodationApplication as Application,
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../../@types/shared'

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
  }
}
