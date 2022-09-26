import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'

import type { PremisesCapacityItem } from 'approved-premises'
import { DateFormats } from '../../utils/dateFormats'

export default Factory.define<PremisesCapacityItem>(() => ({
  availableBeds: faker.datatype.number({ min: -1, max: 2 }),
  date: DateFormats.formatApiDate(faker.date.soon()),
}))
