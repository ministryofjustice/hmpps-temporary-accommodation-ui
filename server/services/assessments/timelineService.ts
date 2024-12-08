import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import { TimelineItem } from '@approved-premises/ui'
import type { RestClientBuilder } from '../../data'
import { CallConfig } from '../../data/restClient'
import TimelineClient from '../../data/timelineClient'
import { timelineData } from '../../utils/assessments/timelineUtils'

export default class TimelineService {
  constructor(private readonly timelineClientFactory: RestClientBuilder<TimelineClient>) {}

  async getTimelineForAssessment(
    callConfig: CallConfig,
    assessmentId: TemporaryAccommodationApplication['assessmentId'],
  ): Promise<Array<TimelineItem>> {
    const timelineClient = this.timelineClientFactory(callConfig)

    const rawTimelineData = await timelineClient.fetch(assessmentId)

    return timelineData(rawTimelineData)
  }
}
