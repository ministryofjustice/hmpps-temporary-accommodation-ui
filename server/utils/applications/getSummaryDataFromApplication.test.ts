import applicationDataJson from '../../../cypress_shared/fixtures/applicationData.json'
import { applicationFactory } from '../../testutils/factories'
import getSummaryDataFromApplication from './getSummaryDataFromApplication'

describe('getSummaryDataFromApplication', () => {
  it('returns summary data from the application', () => {
    const application = applicationFactory.build({ data: applicationDataJson })

    expect(getSummaryDataFromApplication(application)).toEqual({
      isAbleToShare: true,
    })
  })
})
