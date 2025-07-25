import type { ReferenceData } from '@approved-premises/ui'
import type { Cas3Departure, Cas3NewDeparture, Departure } from '@approved-premises/api'
import type { BookingClient, ReferenceDataClient, RestClientBuilder } from '../data'
import { DateFormats } from '../utils/dateUtils'
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

  async getDeparture(
    callConfig: CallConfig,
    premisesId: string,
    bookingId: string,
    departureId: string,
  ): Promise<Departure> {
    const departureClient = this.bookingClientFactory(callConfig)

    const departure = await departureClient.findDeparture(premisesId, bookingId, departureId)

    return { ...departure, dateTime: DateFormats.isoDateToUIDate(departure.dateTime) }
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
