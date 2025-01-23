import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { TimelineItem } from '@approved-premises/ui'
import { ReferralHistoryNote } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referralHistoryDomainEventNoteFactory from './referralHistoryDomainEventNote'
import referralHistorySystemNoteFactory from './referralHistorySystemNote'
import referralHistoryUserNoteFactory from './referralHistoryUserNote'
import * as timelineUtils from '../../utils/assessments/timelineUtils'

export type TimeLineFactory = {
  events: Array<ReferralHistoryNote>
  timelineData: Array<TimelineItem>
}

export const timelineEventsFactory = Factory.define<TimeLineFactory>(() => {
  const userNote1 = referralHistoryUserNoteFactory.build({
    createdByUserName: 'SOME USER',
    createdAt: '2024-04-01',
  })
  const userNote2 = referralHistoryUserNoteFactory.build({
    createdByUserName: 'ANOTHER USER',
    createdAt: '2024-05-01',
  })
  const systemNote1 = referralHistorySystemNoteFactory.build({
    createdByUserName: 'SOME USER',
    createdAt: '2024-04-02',
    category: 'in_review',
  })
  const systemNote2 = referralHistorySystemNoteFactory.build({
    createdByUserName: 'ANOTHER USER',
    createdAt: '2024-05-02',
    category: 'ready_to_place',
  })

  const domainEventNote1 = referralHistoryDomainEventNoteFactory.build({
    createdByUserName: 'SOME USER',
    createdAt: '2024-06-02',
    messageDetails: {
      domainEvent: {
        eventType: 'accommodation.cas3.assessment.updated',
        timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
        updatedFields: [
          {
            fieldName: 'accommodationRequiredFromDate',
            updatedTo: '2025-09-02',
            updatedFrom: '2123-09-02',
          },
        ],
      },
    },
  })

  const domainEventNote2 = referralHistoryDomainEventNoteFactory.build({
    createdByUserName: 'ANOTHER USER',
    createdAt: '2024-06-01',
    messageDetails: {
      domainEvent: {
        eventType: 'accommodation.cas3.assessment.updated',
        timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
        updatedFields: [
          {
            fieldName: 'releaseDate',
            updatedTo: '2025-09-02',
            updatedFrom: '2123-09-02',
          },
        ],
      },
    },
  })

  const finalNotes = [systemNote1, systemNote2, userNote2, userNote1, domainEventNote1, domainEventNote2]

  // Return the final timeline data
  return {
    events: finalNotes,
    timelineData: timelineUtils.timelineData(finalNotes as Array<ReferralHistoryNote>) as Array<TimelineItem>,
  }
})
