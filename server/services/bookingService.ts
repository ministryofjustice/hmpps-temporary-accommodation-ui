import type { Booking, NewBooking, Room, NewTemporaryAccommodationBooking } from '@approved-premises/api'
import type { TableRow } from '@approved-premises/ui'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import { formatStatus } from '../utils/bookingUtils'
import { CallConfig } from '../data/restClient'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async create(callConfig: CallConfig, premisesId: string, booking: NewBooking): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedBooking = await bookingClient.create(premisesId, booking)

    return confirmedBooking
  }

  async createForBedspace(
    callConfig: CallConfig,
    premisesId: string,
    room: Room,
    booking: NewBooking,
  ): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedBooking = await bookingClient.create(premisesId, {
      serviceName: 'temporary-accommodation',
      bedId: room.beds[0].id,
      ...booking,
    } as NewTemporaryAccommodationBooking)

    return confirmedBooking
  }

  async find(callConfig: CallConfig, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
  }

  async getTableRowsForBedspace(callConfig: CallConfig, premisesId: string, room: Room): Promise<Array<TableRow>> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    const bedId = room.beds[0].id

    return bookings
      .filter(booking => booking?.bed.id === bedId)
      .sort((a, b) => {
        return (
          DateFormats.convertIsoToDateObj(b.arrivalDate).getTime() -
          DateFormats.convertIsoToDateObj(a.arrivalDate).getTime()
        )
      })
      .map(booking => {
        return [
          this.textValue(booking.person.crn),
          this.textValue(DateFormats.isoDateToUIDate(booking.arrivalDate, { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' })),
          this.htmlValue(formatStatus(booking.status)),
          this.htmlValue(
            `<a href="${paths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${booking.person.crn}</span></a>`,
          ),
        ]
      })
  }

  async getBooking(callConfig: CallConfig, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
