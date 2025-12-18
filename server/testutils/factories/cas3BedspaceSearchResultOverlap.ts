import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { Cas3v2BedspaceSearchResultOverlap } from '../../@types/shared'
import { fullPersonFactory } from './person'

export default Factory.define<Cas3v2BedspaceSearchResultOverlap>(() => ({
  assessmentId: faker.string.uuid(),
  bedspaceId: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  crn: fullPersonFactory.build().crn,
  days: faker.number.int({ min: 1, max: 100 }),
  isSexualRisk: false,
  name: faker.person.fullName(),
  personType: 'FullPerson',
  sex: faker.helpers.arrayElement(['Male', 'Female']),
}))
