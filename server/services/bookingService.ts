import { isSameDay, isWithinInterval, addDays } from 'date-fns'

import type {
  Booking,
  NewBooking,
  Extension,
  NewExtension,
  Room,
  NewTemporaryAccommodationBooking,
} from '@approved-premises/api'
import type { TableRow, GroupedListofBookings, SummaryList } from '@approved-premises/ui'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import apPaths from '../paths/manage'
import taPaths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'
import { formatStatus } from '../utils/bookingUtils'

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
      .sort(
        (a, b) =>
          DateFormats.convertIsoToDateObj(b.arrivalDate).getTime() -
          DateFormats.convertIsoToDateObj(a.arrivalDate).getTime(),
      )
      .map(booking => {
        return [
          this.textValue(booking.person.crn),
          this.textValue(DateFormats.isoDateToUIDate(booking.arrivalDate, { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' })),
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

    return {
      booking,
      summaryList: {
        rows: [
          {
            key: this.textValue('Status'),
            value: this.htmlValue(formatStatus(booking.status)),
          },
          {
            key: this.textValue('Start date'),
            value: this.textValue(DateFormats.isoDateToUIDate(booking.arrivalDate)),
          },
          {
            key: this.textValue('End date'),
            value: this.textValue(DateFormats.isoDateToUIDate(booking.departureDate)),
          },
        ],
      },
    }
  }

  async listOfBookingsForPremisesId(token: string, premisesId: string): Promise<Array<TableRow>> {
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    return this.bookingsToTableRows(bookings, premisesId, 'arrival')
  }

  async groupedListOfBookingsForPremisesId(token: string, premisesId: string): Promise<GroupedListofBookings> {
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)
    const today = new Date(new Date().setHours(0, 0, 0, 0))

    return {
      arrivingToday: this.bookingsToTableRows(this.bookingsArrivingToday(bookings, today), premisesId, 'arrival'),
      departingToday: this.bookingsToTableRows(this.bookingsDepartingToday(bookings, today), premisesId, 'departure'),
      upcomingArrivals: this.bookingsToTableRows(this.upcomingArrivals(bookings, today), premisesId, 'arrival'),
      upcomingDepartures: this.bookingsToTableRows(this.upcomingDepartures(bookings, today), premisesId, 'departure'),
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

  bookingsToTableRows(bookings: Array<Booking>, premisesId: string, type: 'arrival' | 'departure'): Array<TableRow> {
    return bookings.map(booking => [
      {
        text: booking.person.crn,
      },
      {
        text: DateFormats.isoDateToUIDate(type === 'arrival' ? booking.arrivalDate : booking.departureDate),
      },
      {
        html: `<a href="${apPaths.bookings.show({ premisesId, bookingId: booking.id })}">
          Manage
          <span class="govuk-visually-hidden">
            booking for ${booking.person.crn}
          </span>
        </a>`,
      },
    ])
  }

  async currentResidents(token: string, premisesId: string): Promise<Array<TableRow>> {
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)
    const arrivedBookings = this.arrivedBookings(bookings)

    return this.currentResidentsToTableRows(arrivedBookings, premisesId)
  }

  currentResidentsToTableRows(bookings: Array<Booking>, premisesId: string): Array<TableRow> {
    return bookings.map(booking => [
      {
        text: booking.person.crn,
      },
      {
        text: DateFormats.isoDateToUIDate(booking.departureDate),
      },
      {
        html: `<a href="${apPaths.bookings.show({ premisesId, bookingId: booking.id })}">
        Manage
        <span class="govuk-visually-hidden">
          booking for ${booking.person.crn}
        </span>
      </a>`,
      },
    ])
  }

  private bookingsArrivingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking =>
      isSameDay(DateFormats.convertIsoToDateObj(booking.arrivalDate), today),
    )
  }

  private bookingsDepartingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking =>
      isSameDay(DateFormats.convertIsoToDateObj(booking.departureDate), today),
    )
  }

  private upcomingArrivals(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking => this.isUpcoming(booking.arrivalDate, today))
  }

  private upcomingDepartures(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking => this.isUpcoming(booking.departureDate, today))
  }

  private arrivedBookings(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'arrived')
  }

  private bookingsAwaitingArrival(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'awaiting-arrival')
  }

  private isUpcoming(date: string, today: Date) {
    return isWithinInterval(DateFormats.convertIsoToDateObj(date), {
      start: addDays(today, 1),
      end: addDays(today, this.UPCOMING_WINDOW_IN_DAYS + 1),
    })
  }

  private textValue(value: string) {
    return { text: value }
  }

  private htmlValue(value: string) {
    return { html: value }
  }
}
