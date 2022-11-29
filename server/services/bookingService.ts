import type {
  Booking,
  NewBooking,
  Extension,
  NewExtension,
  Room,
  NewTemporaryAccommodationBooking,
} from '@approved-premises/api'
import type { TableRow, SummaryList } from '@approved-premises/ui'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import taPaths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import { formatStatus } from '../utils/bookingUtils'
import { formatLines } from '../utils/viewUtils'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async create(token: string, premisesId: string, booking: NewBooking): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.create(premisesId, booking)

    return confirmedBooking
  }

  async createForBedspace(token: string, premisesId: string, room: Room, booking: NewBooking): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.create(premisesId, {
      serviceName: 'temporary-accommodation',
      bedId: room.beds[0].id,
      ...booking,
    } as NewTemporaryAccommodationBooking)

    return confirmedBooking
  }

  async find(token: string, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
  }

  async getTableRowsForBedspace(token: string, premisesId: string, room: Room): Promise<Array<TableRow>> {
    const bookingClient = this.bookingClientFactory(token)
    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    const bedId = room.beds[0].id

    return bookings
      .filter(booking => booking?.bed.id === bedId)
      .sort((a, b) => {
        const arrivalDateA = this.displayDates(a).arrivalDate
        const arrivalDateB = this.displayDates(b).arrivalDate

        return (
          DateFormats.convertIsoToDateObj(arrivalDateB).getTime() -
          DateFormats.convertIsoToDateObj(arrivalDateA).getTime()
        )
      })
      .map(booking => {
        const { arrivalDate, departureDate } = this.displayDates(booking)

        return [
          this.textValue(booking.person.crn),
          this.textValue(DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(departureDate, { format: 'short' })),
          this.htmlValue(formatStatus(booking.status)),
          this.htmlValue(
            `<a href="${taPaths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: booking.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${booking.person.crn}</span></a>`,
          ),
        ]
      })
  }

  async getBookingDetails(
    token: string,
    premisesId: string,
    bookingId: string,
  ): Promise<{ booking: Booking; summaryList: SummaryList }> {
    const bookingClient = this.bookingClientFactory(token)
    const booking = await bookingClient.find(premisesId, bookingId)

    const { arrivalDate, departureDate } = this.displayDates(booking)

    const rows = [
      {
        key: this.textValue('Status'),
        value: this.htmlValue(formatStatus(booking.status)),
      },
      {
        key: this.textValue(booking.status === 'arrived' ? 'Arrival date' : 'Start date'),
        value: this.textValue(DateFormats.isoDateToUIDate(arrivalDate)),
      },
      {
        key: this.textValue(booking.status === 'arrived' ? 'Expected departure date' : 'End date'),
        value: this.textValue(DateFormats.isoDateToUIDate(departureDate)),
      },
    ]

    if (booking.status === 'confirmed') {
      rows.push({
        key: this.textValue('Notes'),
        value: this.htmlValue(formatLines(booking.confirmation.notes)),
      })
    } else if (booking.status === 'arrived') {
      rows.push({
        key: this.textValue('Notes'),
        value: this.htmlValue(formatLines(booking.arrival.notes)),
      })
    }

    return {
      booking,
      summaryList: {
        rows,
      },
    }
  }

  async extendBooking(
    token: string,
    premisesId: string,
    bookingId: string,
    bookingExtension: NewExtension,
  ): Promise<Extension> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.extendBooking(premisesId, bookingId, bookingExtension)

    return confirmedBooking
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }

  private displayDates(booking: Booking): { arrivalDate: string; departureDate: string } {
    if (booking.status === 'arrived') {
      return { arrivalDate: booking.arrival.arrivalDate, departureDate: booking.arrival.expectedDepartureDate }
    }

    return { arrivalDate: booking.arrivalDate, departureDate: booking.departureDate }
  }
}
