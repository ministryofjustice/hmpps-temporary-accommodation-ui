import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { ReferenceData } from '../../@types/ui'

export default Factory.define<ReferenceData>(() => {
  return {
    id: faker.string.uuid(),
    name: faker.location.county(),
    isActive: true,
    serviceScope: 'temporary-accommodation',
  }
})
