/* istanbul ignore file */

import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { NewTurnaround } from '@approved-premises/api'

export default Factory.define<NewTurnaround>(() => ({
  workingDays: faker.number.int({ min: 0, max: 10 }),
}))
