import type { ReferralHistoryDomainEventNote, ReferralHistoryNoteMessageDetails } from '@approved-premises/api'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<ReferralHistoryDomainEventNote>(() => ({
  id: faker.string.uuid(),
  createdByUserName: faker.person.fullName(),
  createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
  message: '',
  messageDetails: {
    domainEvent: {
      id: faker.string.uuid(),
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
  } as ReferralHistoryNoteMessageDetails,
  type: 'domainEvent',
}))
