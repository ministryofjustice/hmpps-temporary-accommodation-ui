import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Premises, Cas3PremisesArchiveAction } from '@approved-premises/api'
import characteristicFactory from './characteristic'
import localAuthorityFactory from './localAuthority'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'

class Cas3PremisesFactory extends Factory<Cas3Premises> {
  withEndDate() {
    return this.params({ endDate: DateFormats.dateObjToIsoDate(faker.date.future()) })
  }

  withArchiveHistory(length: number = 5) {
    return this.params({
      archiveHistory: Array.from(
        { length },
        () =>
          ({
            date: DateFormats.dateObjToIsoDate(faker.date.past()),
            status: faker.helpers.arrayElement(['online', 'archived'] as const),
          }) as Cas3PremisesArchiveAction,
      ),
    })
  }
}

export default Cas3PremisesFactory.define(() => ({
  id: faker.string.uuid(),
  reference: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  addressLine1: faker.location.streetAddress(),
  addressLine2: faker.location.secondaryAddress(),
  town: faker.location.city(),
  postcode: faker.location.zipCode(),
  probationRegion: referenceDataFactory.probationRegion().build(),
  probationDeliveryUnit: referenceDataFactory.pdu().build(),
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
  totalOnlineBedspaces: faker.number.int({ min: 1, max: 10 }),
  totalArchivedBedspaces: faker.number.int({ min: 1, max: 5 }),
  totalUpcomingBedspaces: faker.number.int({ min: 1, max: 5 }),
  characteristics: characteristicFactory.buildList(5),
  localAuthorityArea: localAuthorityFactory.build(),
  turnaroundWorkingDays: faker.number.int({ min: 1, max: 7 }),
  notes: faker.lorem.sentences(5),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  scheduleUnarchiveDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
