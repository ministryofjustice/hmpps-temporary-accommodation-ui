import { applicationFactory } from '../../testutils/factories'
import getSummaryDataFromApplication from './getSummaryDataFromApplication'

describe('getSummaryDataFromApplication', () => {
  it('returns summary data from the application', () => {
    const application = applicationFactory.build()

    expect(getSummaryDataFromApplication(application)).toEqual({})
  })
})
