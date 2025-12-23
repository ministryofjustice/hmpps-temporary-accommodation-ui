import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'

import type { Cas3Extension } from '@approved-premises/api'
import { addDays } from 'date-fns'
import { DateFormats } from '../../utils/dateUtils'

class Cas3ExtensionFactory extends Factory<Cas3Extension> {
  afterArrival(arrival: string, days: number = 84) {
    const arrivalDate = DateFormats.isoToDateObj(arrival)
    const dayAfterArrival = addDays(arrivalDate, 1)
    const newDepartureDate = faker.date.soon({ refDate: dayAfterArrival, days: days - 1 })
    return this.params({
      newDepartureDate: DateFormats.dateObjToIsoDate(newDepartureDate),
    })
  }
}

export default Cas3ExtensionFactory.define(() => ({
  bookingId: faker.string.uuid(),
  createdAt: DateFormats.dateObjToIsoDateTime(faker.date.recent()),
  id: faker.string.uuid(),
  newDepartureDate: DateFormats.dateObjToIsoDate(faker.date.future({ years: 1 })),
  notes: faker.lorem.sentence(),
  previousDepartureDate: DateFormats.dateObjToIsoDate(faker.date.soon()),
}))
