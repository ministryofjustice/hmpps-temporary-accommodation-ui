/* istanbul ignore file */

import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import type { NewTurnaround } from '@approved-premises/api'

export default Factory.define<NewTurnaround>(() => ({
  workingDays: faker.number.int({ min: 0, max: 10 }),
}))
