import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { ApArea, TemporaryAccommodationPremises as Premises } from '@approved-premises/api'
import { ReferenceData } from '../../@types/ui'
import { unique } from '../../utils/utils'
import characteristicFactory from './characteristic'
import localAuthorityFactory from './localAuthority'
import pduFactory from './pdu'
import probationRegionFactory from './probationRegion'
import referenceDataFactory from './referenceData'

class PremisesFactory extends Factory<Premises> {
  active() {
    return this.params({
      status: 'active',
    })
  }

  archived() {
    return this.params({
      status: 'archived',
    })
  }

  /* istanbul ignore next */
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
      pdu: pdu.id,
      probationDeliveryUnit: pdu,
      characteristics: faker.helpers
        .arrayElements(characteristics, faker.datatype.number({ min: 1, max: 5 }))
        .map(characteristic =>
          characteristicFactory.build({
            ...characteristic,
            modelScope: 'premises',
          }),
        ),
    })
  }
}

export default PremisesFactory.define(() => {
  const pdu = referenceDataFactory.pdu().build()

  return {
    id: faker.string.uuid(),
    name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    addressLine1: faker.address.streetAddress(),
    addressLine2: faker.address.secondaryAddress(),
    town: faker.address.cityName(),
    postcode: faker.address.zipCode(),
    bedCount: 50,
    availableBedsForToday: faker.datatype.number({ min: 0, max: 50 }),
    apAreaId: faker.random.alphaNumeric(2, { casing: 'upper' }),
    probationRegion: referenceDataFactory.probationRegion().build(),
    apArea: apAreaFactory.build(),
    localAuthorityArea: referenceDataFactory.localAuthority().build(),
    pdu: pdu.id,
    probationDeliveryUnit: pdu,
    characteristics: unique(
      referenceDataFactory.characteristic('premises').buildList(faker.datatype.number({ min: 1, max: 5 })),
    ),
    status: faker.helpers.arrayElement(['active', 'archived'] as const),
    notes: faker.lorem.lines(5),
    turnaroundWorkingDayCount: faker.datatype.number({ min: 1, max: 5 }),
  }
})

const apAreaFactory = Factory.define<ApArea>(() => ({
  id: faker.string.uuid(),
  name: faker.address.cityName(),
  identifier: faker.random.alphaNumeric(),
}))
