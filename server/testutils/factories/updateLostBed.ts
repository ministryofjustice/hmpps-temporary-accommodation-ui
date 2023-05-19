import type { UpdateLostBed } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<UpdateLostBed>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  reason: referenceDataFactory.lostBedReasons().build().id,
  notes: faker.lorem.sentence(),
  referenceNumber: faker.string.uuid(),
  id: faker.string.uuid(),
}))
