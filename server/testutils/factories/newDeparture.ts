import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { NewDeparture } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import premisesFactory from './premises'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewDeparture>(() => {
  const date = faker.date.soon()
  return {
    dateTime: DateFormats.formatApiDateTime(date),
    'dateTime-day': date.getDate().toString(),
    'dateTime-month': date.getMonth().toString(),
    'dateTime-year': date.getFullYear().toString(),
    reasonId: referenceDataFactory.departureReasons().build().id,
    notes: faker.lorem.sentence(),
    moveOnCategoryId: referenceDataFactory.moveOnCategories().build().id,
    destinationProviderId: referenceDataFactory.destinationProviders().build().id,
    destinationAp: premisesFactory.build().id,
  }
})
