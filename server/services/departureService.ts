import { parseISO } from 'date-fns'

import type { Departure } from 'approved-premises'
import type { RestClientBuilder, DepartureClient } from '../data'

export default class DepartureService {
  // TODO: We need to do some more work on authentication to work
  // out how to get this token, so let's stub for now
  token = 'FAKE_TOKEN'

  constructor(private readonly departureClientFactory: RestClientBuilder<DepartureClient>) {}

  async createDeparture(
    premisesId: string,
    bookingId: string,
    departure: Omit<Departure, 'id' | 'bookingId'>,
  ): Promise<Departure> {
    const departureClient = this.departureClientFactory(this.token)

    const confirmedDeparture = await departureClient.create(premisesId, bookingId, departure)

    return confirmedDeparture
  }

  async getDeparture(premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const departureClient = this.departureClientFactory(this.token)

    const departure = await departureClient.get(premisesId, bookingId, departureId)

    return { ...departure, dateTime: parseISO(departure.dateTime).toLocaleDateString('en-GB') }
  }
}
