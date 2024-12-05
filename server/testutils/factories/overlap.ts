import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import { TemporaryAccommodationBedSearchResultOverlap as Overlap } from '../../@types/shared'
import assessmentFactory from './assessment'
import { fullPersonFactory } from './person'

export default Factory.define<Overlap>(() => ({
  crn: fullPersonFactory.build().crn,
  name: fullPersonFactory.build().name,
  sex: fullPersonFactory.build().sex,
  roomId: faker.string.uuid(),
  personType: fullPersonFactory.build().type,
  bookingId: faker.string.uuid(),
  assessmentId: assessmentFactory.build().id,
  days: faker.number.int({ min: 1, max: 100 }),
}))
