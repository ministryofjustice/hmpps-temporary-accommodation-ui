import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { LocalAuthorityArea } from '@approved-premises/api'

export default Factory.define<LocalAuthorityArea>(() => {
  const name = faker.address.county()
  return {
    id: faker.datatype.uuid(),
    identifier: name.toLocaleLowerCase(),
    name,
  }
})
