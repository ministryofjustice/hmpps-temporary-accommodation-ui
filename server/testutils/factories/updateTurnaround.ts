/* istanbul ignore file */

import type { UpdateTurnaround } from '@approved-premises/api'
import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

export default Factory.define<UpdateTurnaround>(() => ({
  workingDays: faker.datatype.number({ min: 1, max: 10 }),
}))
