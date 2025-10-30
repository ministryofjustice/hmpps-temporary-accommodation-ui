import type { ReferenceData } from '@approved-premises/ui'
import type { Cas3Departure, Cas3NewDeparture } from '@approved-premises/api'
import type { BookingClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { CallConfig } from '../data/restClient'

export type DepartureReferenceData = {
  departureReasons: Array<ReferenceData>
  moveOnCategories: Array<ReferenceData>
}

export default class DepartureService {
  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly referenceDataClientFactory: RestClientBuilder<ReferenceDataClient>,
  ) {}

  async createDeparture(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    departure: Cas3NewDeparture,
  ): Promise<Cas3Departure> {
    const bookingClient = this.bookingClientFactory(callConfig)

    return bookingClient.markDeparture(premisesId, bookingId, departure)
  }

  async getReferenceData(callConfig: CallConfig): Promise<DepartureReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(callConfig)

    const [departureReasons, moveOnCategories] = await Promise.all([
      (await referenceDataClient.getReferenceData('departure-reasons')).sort((a, b) => a.name.localeCompare(b.name)),
      (await referenceDataClient.getReferenceData('move-on-categories')).sort((a, b) => a.name.localeCompare(b.name)),
    ])

    return {
      departureReasons,
      moveOnCategories,
    }
  }
}
