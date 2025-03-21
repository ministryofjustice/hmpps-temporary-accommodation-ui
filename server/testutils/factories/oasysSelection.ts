import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { OASysSection } from '@approved-premises/api'

class OasysSelectionFactory extends Factory<OASysSection> {
  /* istanbul ignore next */
  needsLinkedToHarm() {
    return this.params({ linkedToHarm: true, linkedToReOffending: true })
  }

  /* istanbul ignore next */
  needsLinkedToReoffending() {
    return this.params({ linkedToHarm: false, linkedToReOffending: true })
  }

  /* istanbul ignore next */
  needsNotLinkedToReoffending() {
    return this.params({ linkedToHarm: false, linkedToReOffending: false })
  }
}

export default OasysSelectionFactory.define(() => ({
  section: faker.number.int({ min: 1, max: 20 }),
  name: faker.helpers.arrayElement([
    'accommodation',
    'relationships',
    'emotional',
    'thinking',
    'ete',
    'lifestyle',
    'health',
    'attitudes',
  ]),
  linkedToHarm: faker.datatype.boolean(),
  linkedToReOffending: faker.datatype.boolean(),
}))
