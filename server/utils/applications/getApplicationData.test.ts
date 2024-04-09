import applicationDataJson from '../../../cypress_shared/fixtures/applicationData.json'
import { applicationFactory } from '../../testutils/factories'
import { getApplicationSubmissionData, getApplicationUpdateData } from './getApplicationData'

describe('getApplicationUpdateData', () => {
  it('extracts data for updating an application', () => {
    const application = applicationFactory.withData().build()

    expect(getApplicationUpdateData(application)).toEqual({
      data: application.data,
      type: 'CAS3',
    })
  })
})

describe('getApplicationSubmissionData', () => {
  it('extracts data for submitting an application', () => {
    const application = applicationFactory.build({ data: applicationDataJson })

    expect(getApplicationSubmissionData(application)).toEqual({
      translatedDocument: application.document,
      type: 'CAS3',
      arrivalDate: applicationDataJson.eligibility['accommodation-required-from-date'].accommodationRequiredFromDate,
      summaryData: {
        isAbleToShare: true,
        releaseType: 'Approved Premises',
      },
      isDutyToReferSubmitted: true,
      dutyToReferSubmissionDate: '2022-04-12',
      dutyToReferLocalAuthorityAreaName: 'Barking and Dagenham',
      needsAccessibleProperty: true,
      isApplicationEligible: true,
      eligibilityReason: applicationDataJson.eligibility['eligibility-reason'].reason,
      personReleaseDate: '2123-09-02',
      isHistoryOfSexualOffence: false,
      isRegisteredSexOffender: undefined,
      isConcerningSexualBehaviour: true,
      hasHistoryOfArson: false,
      isConcerningArsonBehaviour: true,
    })
  })
})
