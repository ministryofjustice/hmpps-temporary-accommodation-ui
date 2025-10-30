import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3PremisesBedspaceTotals } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

class Cas3PremisesBedspaceTotalsFactory extends Factory<Cas3PremisesBedspaceTotals> {
  withEndDate() {
    return this.params({
      premisesEndDate: DateFormats.dateObjToIsoDate(faker.date.future()),
    })
  }
}

export default Cas3PremisesBedspaceTotalsFactory.define(() => ({
  id: faker.string.uuid(),
  status: faker.helpers.arrayElement(['online', 'archived'] as const),
  totalOnlineBedspaces: faker.number.int({ min: 1, max: 10 }),
  totalArchivedBedspaces: faker.number.int({ min: 1, max: 5 }),
  totalUpcomingBedspaces: faker.number.int({ min: 1, max: 5 }),
}))
