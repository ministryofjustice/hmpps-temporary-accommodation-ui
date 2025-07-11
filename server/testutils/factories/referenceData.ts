import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { ReferenceData } from '@approved-premises/ui'

import cancellationReasonsJson from '../stubs/cancellation-reasons.json'
import characteristicsJson from '../stubs/characteristics.json'
import departureReasonsJson from '../stubs/departure-reasons.json'
import destinationProvidersJson from '../stubs/destination-providers.json'
import localAuthoritiesJson from '../stubs/local-authorities.json'
import lostBedReasonsJson from '../stubs/lost-bed-reasons.json'
import moveOnCategoriesJson from '../stubs/move-on-categories.json'
import nonArrivalReasonsJson from '../stubs/non-arrival-reasons.json'
import pdusJson from '../stubs/pdus.json'
import probationRegionsJson from '../stubs/probation-regions.json'
import { Characteristic, LocalAuthorityArea } from '../../@types/shared'

class ReferenceDataFactory extends Factory<ReferenceData> {
  departureReasons() {
    const data = faker.helpers.arrayElement(departureReasonsJson)
    return this.params(data as ReferenceData)
  }

  moveOnCategories() {
    const data = faker.helpers.arrayElement(moveOnCategoriesJson)
    return this.params(data as ReferenceData)
  }

  destinationProviders() {
    const data = faker.helpers.arrayElement(destinationProvidersJson)
    return this.params(data)
  }

  cancellationReasons() {
    const data = faker.helpers.arrayElement(cancellationReasonsJson)
    return this.params(data)
  }

  lostBedReasons() {
    const data = faker.helpers.arrayElement(lostBedReasonsJson)
    return this.params(data as ReferenceData)
  }

  nonArrivalReason() {
    const data = faker.helpers.arrayElement(nonArrivalReasonsJson)
    return this.params(data)
  }

  characteristic(modelScope: 'premises' | 'room'): Factory<Characteristic> {
    return Factory.define<Characteristic>(() => {
      return faker.helpers.arrayElement(
        (characteristicsJson as Characteristic[]).filter(
          characteristic => characteristic.modelScope === modelScope || characteristic.modelScope === '*',
        ),
      )
    })
  }

  localAuthority(): Factory<LocalAuthorityArea> {
    return Factory.define<LocalAuthorityArea>(() => faker.helpers.arrayElement(localAuthoritiesJson))
  }

  probationRegion(): Factory<ReferenceData> {
    return Factory.define<ReferenceData>(() => faker.helpers.arrayElement(probationRegionsJson) as ReferenceData)
  }

  pdu(): Factory<ReferenceData> {
    return Factory.define<ReferenceData>(() => faker.helpers.arrayElement(pdusJson) as ReferenceData)
  }
}

export default ReferenceDataFactory.define(() => ({
  id: faker.string.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  isActive: true,
  serviceScope: 'temporary-accommodation',
}))
