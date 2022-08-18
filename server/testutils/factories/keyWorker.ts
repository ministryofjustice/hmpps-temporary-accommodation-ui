import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { KeyWorker } from 'approved-premises'

export default Factory.define<KeyWorker>(() => ({
  id: faker.datatype.uuid(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
}))
