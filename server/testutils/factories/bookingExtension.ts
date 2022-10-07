import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import type { BookingExtension } from 'approved-premises'

import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<BookingExtension>(() => ({
  id: faker.datatype.uuid(),
  previousDepartureDate: DateFormats.formatApiDate(faker.date.soon()),
  newDepartureDate: DateFormats.formatApiDate(faker.date.future()),
  bookingId: faker.datatype.uuid(),
  notes: faker.lorem.sentence(),
}))
