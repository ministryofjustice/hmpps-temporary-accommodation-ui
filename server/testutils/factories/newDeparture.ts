import { Factory } from 'fishery'
import { fakerEN_GB as faker } from '@faker-js/faker'

import type { NewDeparture } from '@approved-premises/api'
import referenceDataFactory from './referenceData'
import premisesFactory from './premises'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewDeparture>(() => {
  const date = faker.date.soon()
  return {
    dateTime: DateFormats.dateObjToIsoDateTime(date),
    reasonId: referenceDataFactory.departureReasons().build().id,
    notes: faker.lorem.sentence(),
    moveOnCategoryId: referenceDataFactory.moveOnCategories().build().id,
    destinationProviderId: referenceDataFactory.destinationProviders().build().id,
    destinationAp: premisesFactory.build().id,
  }
})
