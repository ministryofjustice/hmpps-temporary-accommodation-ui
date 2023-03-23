import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { UpdateLostBed } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<UpdateLostBed>(() => ({
  startDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
  endDate: DateFormats.dateObjToIsoDate(faker.date.future()),
  reason: referenceDataFactory.lostBedReasons().build().id,
  notes: faker.lorem.sentence(),
  referenceNumber: faker.datatype.uuid(),
  id: faker.datatype.uuid(),
}))
