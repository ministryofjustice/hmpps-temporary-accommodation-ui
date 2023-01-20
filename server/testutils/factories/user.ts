import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { User } from '@approved-premises/api'
import referenceData from './referenceData'

export default Factory.define<User>(() => ({
  id: faker.datatype.uuid(),
  roles: [],
  region: referenceData.probationRegion().build(),
  service: 'temporary-accommodation',
}))
