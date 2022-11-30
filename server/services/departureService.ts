import type { ReferenceData } from '@approved-premises/ui'
import type { Departure, NewDeparture } from '@approved-premises/api'
import type { RestClientBuilder, BookingClient, ReferenceDataClient } from '../data'
import { DateFormats } from '../utils/dateUtils'

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
    token: string,
    premisesId: string,
    bookingId: string,
    departure: NewDeparture,
  ): Promise<Departure> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedDeparture = await bookingClient.markDeparture(premisesId, bookingId, departure)

    return confirmedDeparture
  }

  async getDeparture(token: string, premisesId: string, bookingId: string, departureId: string): Promise<Departure> {
    const departureClient = this.bookingClientFactory(token)

    const departure = await departureClient.findDeparture(premisesId, bookingId, departureId)

    return { ...departure, dateTime: DateFormats.isoDateToUIDate(departure.dateTime) }
  }

  async getReferenceData(token: string): Promise<DepartureReferenceData> {
    const referenceDataClient = this.referenceDataClientFactory(token)

    const [departureReasons, moveOnCategories] = await Promise.all([
      referenceDataClient.getReferenceData('departure-reasons'),
      referenceDataClient.getReferenceData('move-on-categories'),
    ])

    return {
      departureReasons,
      moveOnCategories,
    }
  }
}
