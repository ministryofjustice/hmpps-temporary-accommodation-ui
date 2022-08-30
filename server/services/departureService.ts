import { parseISO } from 'date-fns'

import type { Departure, ReferenceData, NewDeparture } from 'approved-premises'
import type { RestClientBuilder, DepartureClient, ReferenceDataClient } from '../data'

export type DepartureReferenceData = {
  departureReasons: Array<ReferenceData>
  moveOnCategories: Array<ReferenceData>
  destinationProviders: Array<ReferenceData>
}

export default class DepartureService {
  constructor(
    private readonly departureClientFactory: RestClientBuilder<DepartureClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createDeparture(
    token: string,
    premisesId: string,
    bookingId: string,
    departure: NewDeparture,
  ): Promise<Departure> {
    const departureClient = this.departureClientFactory(token)

    const confirmedDeparture = await departureClient.create(premisesId, bookingId, departure)

    return confirmedDeparture
  }

  async getDeparture(token: string, premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const departureClient = this.departureClientFactory(token)

    const departure = await departureClient.get(premisesId, bookingId, departureId)

    return { ...departure, dateTime: parseISO(departure.dateTime).toLocaleDateString('en-GB') }
  }

  async getReferenceData(token: string): Promise<DepartureReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const [departureReasons, moveOnCategories, destinationProviders] = await Promise.all([
      referenceDataClient.getReferenceData('departure-reasons'),
      referenceDataClient.getReferenceData('move-on-categories'),
      referenceDataClient.getReferenceData('destination-providers'),
    ])

    return {
      departureReasons,
      moveOnCategories,
      destinationProviders,
    }
  }
}
