import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'

import type { LocalAuthorityArea } from '@approved-premises/api'

export default Factory.define<LocalAuthorityArea>(() => {
  const name = faker.address.county()
  return {
    id: faker.string.uuid(),
    identifier: name.toLocaleLowerCase(),
    name,
  }
})
