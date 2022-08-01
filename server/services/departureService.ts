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
}
