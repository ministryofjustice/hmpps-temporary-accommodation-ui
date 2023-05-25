import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'

describe('getApplicationUpdateData', () => {
  it('extracts data for updating an application', () => {
    const application = applicationFactory.withData().build()

    expect(getApplicationUpdateData(application)).toEqual({
      data: application.data,
    })
  })
})

describe('getApplicationSubmissionData', () => {
  it('extracts data for submitting an application', () => {
    const application = applicationFactory.build()

    expect(getApplicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
    })
  })
})
