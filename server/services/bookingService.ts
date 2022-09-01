import { isSameDay, isWithinInterval, addDays } from 'date-fns'

import type { Booking, NewBooking, TableRow, GroupedListofBookings, BookingExtension } from 'approved-premises'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { convertDateString, formatDate } from '../utils/utils'
import paths from '../paths/manage'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async create(token: string, premisesId: string, booking: NewBooking): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.create(premisesId, booking)

    return confirmedBooking
  }

  async find(token: string, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
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
    bookingExtension: BookingExtension,
  ): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.extendBooking(premisesId, bookingId, bookingExtension)

    return confirmedBooking
  }

  bookingsToTableRows(bookings: Array<Booking>, premisesId: string, type: 'arrival' | 'departure'): Array<TableRow> {
    return bookings.map(booking => [
      {
        text: booking.crn,
      },
      {
        text: formatDate(
          convertDateString(type === 'arrival' ? booking.expectedArrivalDate : booking.expectedDepartureDate),
        ),
      },
      {
        html: `<a href="${paths.bookings.show({ premisesId, bookingId: booking.id })}">
          Manage
          <span class="govuk-visually-hidden">
            booking for ${booking.crn}
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
        text: booking.crn,
      },
      {
        text: formatDate(convertDateString(booking.expectedDepartureDate)),
      },
      {
        html: `<a href="${paths.bookings.show({ premisesId, bookingId: booking.id })}">
        Manage
        <span class="govuk-visually-hidden">
          booking for ${booking.crn}
        </span>
      </a>`,
      },
    ])
  }

  private bookingsArrivingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking =>
      isSameDay(convertDateString(booking.expectedArrivalDate), today),
    )
  }

  private bookingsDepartingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking =>
      isSameDay(convertDateString(booking.expectedDepartureDate), today),
    )
  }

  private upcomingArrivals(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking => this.isUpcoming(booking.expectedArrivalDate, today))
  }

  private upcomingDepartures(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking => this.isUpcoming(booking.expectedDepartureDate, today))
  }

  private arrivedBookings(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'arrived')
  }

  private bookingsAwaitingArrival(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'awaiting-arrival')
  }

  private isUpcoming(date: string, today: Date) {
    return isWithinInterval(convertDateString(date), {
      start: addDays(today, 1),
      end: addDays(today, this.UPCOMING_WINDOW_IN_DAYS + 1),
    })
  }
}
