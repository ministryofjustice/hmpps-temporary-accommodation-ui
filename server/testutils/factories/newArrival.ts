import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { NewCas3Arrival as NewArrival } from '@approved-premises/api'
import { DateFormats } from '../../utils/dateUtils'

export default Factory.define<NewArrival>(({ params }) => {
  const sevenDays = new Date()
  sevenDays.setDate(sevenDays.getDate() - 7)

  let arrivalDate: Date
  let expectedDepartureDate: Date

  if (params.expectedDepartureDate) {
    expectedDepartureDate = DateFormats.isoToDateObj(params.expectedDepartureDate)

    const dayBeforeDeparture = new Date(expectedDepartureDate)
    dayBeforeDeparture.setDate(dayBeforeDeparture.getDate() - 1)

    const now = new Date()
    const latestArrivalDate = dayBeforeDeparture < now ? dayBeforeDeparture : now

    arrivalDate = faker.date.between({ from: sevenDays, to: latestArrivalDate })
  } else {
    arrivalDate = faker.date.soon({ days: 7, refDate: sevenDays })

    const dayAfterArrival = new Date(arrivalDate)
    dayAfterArrival.setDate(dayAfterArrival.getDate() + 1)

    const eightyFourDaysAfterArrival = new Date(arrivalDate)
    eightyFourDaysAfterArrival.setDate(eightyFourDaysAfterArrival.getDate() + 84)

    expectedDepartureDate = faker.date.between({ from: dayAfterArrival, to: eightyFourDaysAfterArrival })
  }

  return {
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    expectedDepartureDate: DateFormats.dateObjToIsoDate(expectedDepartureDate),
    notes: faker.lorem.sentence(),
    type: 'CAS3',
  }
})
