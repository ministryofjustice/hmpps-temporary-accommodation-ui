import { faker } from '@faker-js/faker/locale/en_GB'
import { Factory } from 'fishery'
import { TemporaryAccommodationBedSearchResultOverlap as Overlap } from '../../@types/shared'
import personFactory from './person'

export default Factory.define<Overlap>(() => ({
  crn: personFactory.build().crn,
  roomId: faker.string.uuid(),
  bookingId: faker.string.uuid(),
  days: faker.number.int({ min: 1, max: 100 }),
}))
