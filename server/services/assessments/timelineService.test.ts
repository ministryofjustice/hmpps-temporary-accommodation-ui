import { fakerEN_GB as faker } from '@faker-js/faker'
import { CallConfig } from '../../data/restClient'
import { referralHistorySystemNoteFactory } from '../../testutils/factories'
import TimelineService from './timelineService'
import TimelineClient from '../../data/timelineClient'

jest.mock('../../data/timelineClient.ts')

describe('TimelineService', () => {
  const timelineClient = new TimelineClient(null) as jest.Mocked<TimelineClient>
  const timelineClientFactory = jest.fn()

  const service = new TimelineService(timelineClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    timelineClientFactory.mockReturnValue(timelineClient)
  })

  describe('getTimelineForAssessment', () => {
    it('on success returns the formated timeline data from after receiveing it from api', async () => {
      const systemNote = referralHistorySystemNoteFactory.build({ category: 'submitted' })
      const assessmentId = faker.string.uuid()

      const callConfig = { token: 'some-token' } as CallConfig

      timelineClient.fetch.mockResolvedValue([systemNote])

      const timelineData = await service.getTimelineForAssessment(callConfig, assessmentId)
      // todo
      // test sometimes fails when there's an uppercase letter in the middle of a name
      // e.g. expected: Amy VonRueden, received: Amy Vonrueden
      expect(timelineData).toEqual([
        {
          byline: { text: systemNote.createdByUserName },
          datetime: { timestamp: systemNote.createdAt, type: 'datetime' },
          html: undefined,
          label: { text: 'Referral submitted' },
        },
      ])

      expect(timelineClientFactory).toHaveBeenCalledWith(callConfig)
      expect(timelineClient.fetch).toHaveBeenCalledWith(assessmentId)
    })
  })
})
