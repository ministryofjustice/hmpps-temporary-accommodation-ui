import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LocalAuthority } from '@approved-premises/ui'

export default Factory.define<LocalAuthority>(() => ({
  id: faker.datatype.uuid(),
  name: faker.address.county(),
}))
