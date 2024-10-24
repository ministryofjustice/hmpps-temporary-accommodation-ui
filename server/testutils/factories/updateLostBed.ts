import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { UpdateLostBed } from '@approved-premises/api'
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
