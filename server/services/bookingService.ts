import type { Booking, NewBooking, NewTemporaryAccommodationBooking, Room } from '@approved-premises/api'
import type { TableRow } from '@approved-premises/ui'

import type { LostBedClient, RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import { statusTag } from '../utils/bookingUtils'
import { DateFormats } from '../utils/dateUtils'
import { statusTag as lostBedStatusTag } from '../utils/lostBedUtils'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
  ) {}

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

    const lostBedClient = this.lostBedClientFactory(callConfig)
    const lostBeds = await (
      await lostBedClient.allLostBedsForPremisesId(premisesId)
    ).filter(lostBed => lostBed.status === 'active')

    const bedId = room.beds[0].id

    const bookingRowArr = bookings
      .filter(b => b.bed.id === bedId)
      .map(b => ({
        sortingValue: DateFormats.isoToDateObj(b.arrivalDate).getTime(),
        rows: [
          this.textValue(b.person.crn),
          this.textValue(DateFormats.isoDateToUIDate(b.arrivalDate, { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(b.departureDate, { format: 'short' })),
          this.htmlValue(statusTag(b.status)),
          this.htmlValue(
            `<a href="${paths.bookings.show({
              premisesId,
              roomId: room.id,
              bookingId: b.id,
            })}">View<span class="govuk-visually-hidden"> booking for person with CRN ${b.person.crn}</span></a>`,
          ),
        ],
      }))

    const lostBedRowArr = lostBeds
      .filter(lostBed => lostBed.bedId === bedId)
      .map(lostBed => ({
        sortingValue: DateFormats.isoToDateObj(lostBed.startDate).getTime(),
        rows: [
          this.textValue('-'),
          this.textValue(DateFormats.isoDateToUIDate(lostBed.startDate, { format: 'short' })),
          this.textValue(DateFormats.isoDateToUIDate(lostBed.endDate, { format: 'short' })),
          this.htmlValue(lostBedStatusTag(lostBed.status, 'bookingsAndVoids')),
          this.htmlValue(
            `<a href="${paths.lostBeds.show({
              premisesId,
              roomId: room.id,
              lostBedId: lostBed.id,
            })}">View<span class="govuk-visually-hidden"> void booking</span></a>`,
          ),
        ],
      }))

    return [...bookingRowArr, ...lostBedRowArr]
      .sort((a, b) => {
        return b.sortingValue - a.sortingValue
      })
      .map(bookingOrLostBed => bookingOrLostBed.rows)
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
