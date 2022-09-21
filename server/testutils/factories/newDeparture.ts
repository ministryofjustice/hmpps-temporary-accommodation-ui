import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewDeparture } from 'approved-premises'
import referenceDataFactory from './referenceData'
import premisesFactory from './premises'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<NewDeparture>(() => {
  const date = faker.date.soon()
  return {
    dateTime: DateFormats.formatApiDate(date),
    'dateTime-day': date.getDate().toString(),
    'dateTime-month': date.getMonth().toString(),
    'dateTime-year': date.getFullYear().toString(),
    reason: referenceDataFactory.departureReasons().build().id,
    notes: faker.lorem.sentence(),
    moveOnCategory: referenceDataFactory.moveOnCategories().build().id,
    destinationProvider: referenceDataFactory.destinationProviders().build().id,
    destinationAp: premisesFactory.build().id,
  }
})
