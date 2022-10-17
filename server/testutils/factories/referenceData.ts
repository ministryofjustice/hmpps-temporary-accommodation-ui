import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ReferenceData } from '@approved-premises/ui'

import departureReasonsJson from '../../../wiremock/stubs/departure-reasons.json'
import moveOnCategoriesJson from '../../../wiremock/stubs/move-on-categories.json'
import destinationProvidersJson from '../../../wiremock/stubs/destination-providers.json'
import cancellationReasonsJson from '../../../wiremock/stubs/cancellation-reasons.json'
import lostBedReasonsJson from '../../../wiremock/stubs/lost-bed-reasons.json'

class ReferenceDataFactory extends Factory<ReferenceData> {
  departureReasons() {
    const data = faker.helpers.arrayElement(departureReasonsJson)
    return this.params(data)
  }

  moveOnCategories() {
    const data = faker.helpers.arrayElement(moveOnCategoriesJson)
    return this.params(data)
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
    return this.params(data)
  }
}

export default ReferenceDataFactory.define(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  isActive: true,
}))
