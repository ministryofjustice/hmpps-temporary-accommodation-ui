import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3AssessmentSummary } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'
import risksFactory from './risks'
import referenceDataFactory from './referenceData'

export default Factory.define<Cas3AssessmentSummary>(() => ({
  id: faker.string.uuid(),
  applicationId: faker.string.uuid(),
  arrivalDate: DateFormats.dateObjToIsoDateTime(faker.date.future()),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  dateOfInfoRequest: DateFormats.dateObjToIsoDateTime(faker.date.past()),
  status: 'closed' as const,
  risks: risksFactory.build(),
  person: personFactory.build(),
  probationDeliveryUnitName: referenceDataFactory.pdu().build().name,
}))
