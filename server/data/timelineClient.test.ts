import { fakerEN_GB as faker } from '@faker-js/faker'
import paths from '../paths/api'
import TimelineClient from './timelineClient'
import { CallConfig } from './restClient'
import { referralHistorySystemNoteFactory } from '../testutils/factories'
import describeClient from '../testutils/describeClient'

describeClient('TimelineClient', provider => {
  let timelineClient: TimelineClient
  const callConfig = { token: 'some-token' } as CallConfig

  beforeEach(() => {
    timelineClient = new TimelineClient(callConfig)
  })

  describe('fetch', () => {
    it('returns timeline results', async () => {
      const results = referralHistorySystemNoteFactory.buildList(3)
      const assessmentId = faker.string.uuid()

      await provider.addInteraction({
        state: 'Timeline exists for assessment',
        uponReceiving: 'a request for timeline results',
        withRequest: {
          method: 'GET',
          path: paths.cas3.assessments.timeline({ assessmentId }),
          headers: {
            authorization: `Bearer ${callConfig.token}`,
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: results,
        },
      })

      const result = await timelineClient.fetch(assessmentId)
      expect(result).toEqual(results)
    })
  })
})
