import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { ReferenceData } from '../../@types/ui'

export default Factory.define<ReferenceData>(() => {
  return {
    id: faker.datatype.uuid(),
    name: faker.address.county(),
    isActive: true,
    serviceScope: 'temporary-accommodation',
  }
})
