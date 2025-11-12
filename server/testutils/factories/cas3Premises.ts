import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3Premises, Cas3PremisesArchiveAction } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import localAuthorityFactory from './localAuthority'
import referenceDataFactory from './referenceData'
import { DateFormats } from '../../utils/dateUtils'
import pduFactory from './pdu'
import probationRegionFactory from './probationRegion'
import cas3PremisesCharacteristicsFactory from './cas3PremisesCharacteristics'
import { camelCase, unique } from '../../utils/utils'

class Cas3PremisesFactory extends Factory<Cas3Premises> {
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

  forEnvironment(
    probationRegion: ReferenceData,
    pdus: ReferenceData[],
    localAuthorities: ReferenceData[],
    characteristics: ReferenceData[],
  ) {
    const pdu = pduFactory.build({ ...faker.helpers.arrayElement(pdus) })

    return this.params({
      probationRegion: probationRegionFactory.build({
        ...probationRegion,
      }),
      localAuthorityArea: localAuthorityFactory.build({
        ...faker.helpers.arrayElement(localAuthorities),
      }),
      probationDeliveryUnit: pdu,
      premisesCharacteristics: faker.helpers
        .arrayElements(characteristics, faker.number.int({ min: 1, max: 5 }))
        .map(characteristic =>
          cas3PremisesCharacteristicsFactory.build({
            id: characteristic.id,
            description: characteristic.name,
            name: camelCase(characteristic.name),
          }),
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
  premisesCharacteristics: unique(cas3PremisesCharacteristicsFactory.buildList(faker.number.int({ min: 1, max: 5 }))),
  localAuthorityArea: localAuthorityFactory.build(),
  turnaroundWorkingDays: faker.number.int({ min: 1, max: 7 }),
  notes: faker.lorem.sentences(5),
  startDate: DateFormats.dateObjToIsoDate(faker.date.past()),
  scheduleUnarchiveDate: DateFormats.dateObjToIsoDate(faker.date.future()),
}))
