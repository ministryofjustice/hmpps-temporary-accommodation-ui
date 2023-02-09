import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewLostBed } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewLostBed>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    id: faker.datatype.uuid(),
    notes: faker.lorem.sentence(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    'startDate-day': startDate.getDate().toString(),
    'startDate-month': startDate.getMonth().toString(),
    'startDate-year': startDate.getFullYear().toString(),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    'endDate-day': endDate.getDate().toString(),
    'endDate-month': endDate.getMonth().toString(),
    'endDate-year': endDate.getFullYear().toString(),
    numberOfBeds: faker.datatype.number({ max: 10 }),
    referenceNumber: faker.datatype.uuid(),
    reason: referenceDataFactory.lostBedReasons().build().id,
  }
})
