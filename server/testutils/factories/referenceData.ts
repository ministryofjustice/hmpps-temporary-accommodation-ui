import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { ReferenceData } from 'approved-premises'

import departureReasonsJson from '../../../wiremock/stubs/departure-reasons.json'
import moveOnCategoriesJson from '../../../wiremock/stubs/move-on-categories.json'
import destinationProvidersJson from '../../../wiremock/stubs/destination-providers.json'

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
}

export default ReferenceDataFactory.define(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
  isActive: true,
}))
