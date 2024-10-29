import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { TemporaryAccommodationBedSearchResultOverlap as Overlap } from '../../@types/shared'
import { fullPersonFactory } from './person'

export default Factory.define<Overlap>(() => ({
  crn: fullPersonFactory.build().crn,
  name: fullPersonFactory.build().name,
  roomId: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  days: faker.number.int({ min: 1, max: 100 }),
}))
