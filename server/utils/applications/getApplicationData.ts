import {
  TemporaryAccommodationApplication as Application,
  SubmitTemporaryAccommodationApplication as SubmitApplication,
  UpdateTemporaryAccommodationApplication as UpdateApplication,
} from '../../@types/shared'

export const getApplicationUpdateData = (application: Application): UpdateApplication => {
  return {
    data: application.data,
  }
}

export const getApplicationSubmissionData = (application: Application): SubmitApplication => {
  return {
    translatedDocument: application.document,
  }
}
