import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { LocalAuthorityArea } from '@approved-premises/api'

export default Factory.define<LocalAuthorityArea>(() => {
  const name = faker.location.county()
  return {
    id: faker.string.uuid(),
    identifier: name.toLocaleLowerCase(),
    name,
  }
})
