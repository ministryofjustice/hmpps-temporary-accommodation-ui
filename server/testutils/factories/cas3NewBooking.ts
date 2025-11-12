import { fakerEN_GB as faker } from '@faker-js/faker'
import { Factory } from 'fishery'

import type { Cas3NewBooking } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import { fullPersonFactory as personFactory } from './person'

export default Factory.define<Cas3NewBooking>(() => {
  const arrivalDate = faker.date.soon()

  const dayAfterArrival = new Date(arrivalDate)
  dayAfterArrival.setDate(dayAfterArrival.getDate() + 1)

  // departure can be at most 84 days after arrival,
  // but newArrival validation subtracts 7 days, so use 77 days here.
  const maxDepartureGapDays = 84 - 7
  const latestAllowedDepartureDate = new Date(arrivalDate)
  latestAllowedDepartureDate.setDate(latestAllowedDepartureDate.getDate() + maxDepartureGapDays)

  const expectedDepartureDate = faker.date.between({ from: dayAfterArrival, to: latestAllowedDepartureDate })

  return {
    crn: personFactory.build().crn,
    arrivalDate: DateFormats.dateObjToIsoDate(arrivalDate),
    departureDate: DateFormats.dateObjToIsoDate(expectedDepartureDate),
    bedspaceId: undefined as string,
    assessmentId: undefined as string,
    serviceName: 'temporary-accommodation',
  }
})
