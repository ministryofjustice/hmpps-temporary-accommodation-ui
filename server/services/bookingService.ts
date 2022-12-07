import type { Booking, NewBooking, Room, NewTemporaryAccommodationBooking } from '@approved-premises/api'
import type { TableRow, SummaryList } from '@approved-premises/ui'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import paths from '../paths/temporary-accommodation/manage'
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

  async getBookingDetails(
    token: string,
    premisesId: string,
    bookingId: string,
  ): Promise<{ booking: Booking; summaryList: SummaryList }> {
    const bookingClient = this.bookingClientFactory(token)
    const booking = await bookingClient.find(premisesId, bookingId)

    const { status, arrivalDate, departureDate } = booking

    const rows = [
      {
        key: this.textValue('Status'),
        value: this.htmlValue(formatStatus(status)),
      },
    ] as SummaryList['rows']

    if (status === 'provisional' || status === 'confirmed') {
      rows.push({
        key: this.textValue('Start date'),
        value: this.textValue(DateFormats.isoDateToUIDate(arrivalDate)),
      })

      rows.push({
        key: this.textValue('End date'),
        value: this.textValue(DateFormats.isoDateToUIDate(departureDate)),
      })
    } else if (status === 'arrived') {
      rows.push(
        {
          key: this.textValue('Arrival date'),
          value: this.textValue(DateFormats.isoDateToUIDate(arrivalDate)),
        },
        {
          key: this.textValue('Expected departure date'),
          value: this.textValue(DateFormats.isoDateToUIDate(departureDate)),
        },
      )
    } else if (status === 'departed') {
      rows.push({
        key: this.textValue('Departure date'),
        value: this.textValue(DateFormats.isoDateToUIDate(departureDate)),
      })
    }

    if (status === 'confirmed') {
      rows.push({
        key: this.textValue('Notes'),
        value: this.htmlValue(formatLines(booking.confirmation.notes)),
      })
    } else if (status === 'arrived') {
      rows.push({
        key: this.textValue('Notes'),
        value: this.htmlValue(formatLines(booking.arrival.notes)),
      })
    } else if (status === 'departed') {
      rows.push(
        {
          key: this.textValue('Departure reason'),
          value: this.textValue(booking.departure.reason.name),
        },
        {
          key: this.textValue('Move on category'),
          value: this.textValue(booking.departure.moveOnCategory.name),
        },
        {
          key: this.textValue('Notes'),
          value: this.htmlValue(formatLines(booking.departure.notes)),
        },
      )
    }

    return {
      booking,
      summaryList: {
        rows,
      },
    }
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
