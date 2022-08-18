import { parseISO } from 'date-fns'

import type { Departure, ReferenceData, DepartureDto } from 'approved-premises'
import type { RestClientBuilder, DepartureClient, ReferenceDataClient } from '../data'
import Service from './service'

export type DepartureReferenceData = {
  departureReasons: Array<ReferenceData>
  moveOnCategories: Array<ReferenceData>
  destinationProviders: Array<ReferenceData>
}

export default class DepartureService extends Service {
  constructor(
    private readonly departureClientFactory: RestClientBuilder<DepartureClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {
    super()
  }

  async createDeparture(premisesId: string, bookingId: string, departure: DepartureDto): Promise<Departure> {
    const departureClient = this.departureClientFactory(this.token)

    const confirmedDeparture = await departureClient.create(premisesId, bookingId, departure)

    return confirmedDeparture
  }

  async getDeparture(premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const departureClient = this.departureClientFactory(this.token)

    const departure = await departureClient.get(premisesId, bookingId, departureId)

    return { ...departure, dateTime: parseISO(departure.dateTime).toLocaleDateString('en-GB') }
  }

  async getReferenceData(): Promise<DepartureReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(this.token)

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
