import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { NewTemporaryAccommodationLostBed as NewLostBed } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'
import referenceDataFactory from './referenceData'

export default Factory.define<NewLostBed>(() => {
  const startDate = faker.date.soon()
  const endDate = faker.date.future()
  return {
    notes: faker.lorem.sentence(),
    startDate: DateFormats.dateObjToIsoDate(startDate),
    endDate: DateFormats.dateObjToIsoDate(endDate),
    referenceNumber: faker.datatype.uuid(),
    reason: referenceDataFactory.lostBedReasons().build().id,
    serviceName: 'temporary-accommodation',
    bedId: faker.datatype.uuid(),
  }
})
