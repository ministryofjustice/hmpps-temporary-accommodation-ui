import config from '../config'
import paths from '../paths/temporary-accommodation/manage'
import { SanitisedError } from '../sanitisedError'
import { arrivalFactory, bookingFactory, departureFactory, extensionFactory } from '../testutils/factories'
import {
  bookingActions,
  deriveBookingHistory,
  generateConflictBespokeError,
  generateTurnaroundConflictBespokeError,
  getLatestExtension,
  shortenedOrExtended,
  statusName,
  statusTag,
} from './bookingUtils'

const premisesId = 'premisesId'
const roomId = 'roomId'
const bookingId = 'bookingId'
const lostBedId = 'lostBedId'

const cancelBookingAction = {
  text: 'Cancel booking',
  classes: 'govuk-button--secondary',
  href: paths.bookings.cancellations.new({ premisesId, roomId, bookingId }),
}

const changeTurnaroundAction = {
  text: 'Change turnaround time',
  classes: 'govuk-button--secondary',
  href: paths.bookings.turnarounds.new({ premisesId, roomId, bookingId }),
}

describe('bookingUtils', () => {
  describe('bookingActions', () => {
    describe('when turnarounds are enabled', () => {
      beforeAll(() => {
        config.flags.turnaroundsDisabled = false
      })

      it('returns a mark as confirmed action for a provisional booking', () => {
        const booking = bookingFactory.provisional().build({ id: bookingId })

        expect(bookingActions(premisesId, roomId, booking)).toEqual([
          {
            text: 'Mark as confirmed',
            classes: '',
            href: paths.bookings.confirmations.new({ premisesId, roomId, bookingId }),
          },
          cancelBookingAction,
          changeTurnaroundAction,
        ])
      })

      it('returns a mark as active action for a confirmed booking', () => {
        const booking = bookingFactory.confirmed().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
          {
            text: 'Mark as active',
            classes: '',
            href: paths.bookings.arrivals.new({ premisesId, roomId, bookingId }),
          },
          cancelBookingAction,
          changeTurnaroundAction,
        ])
      })

      it('returns mark as departed and extend actions for an arrived booking', () => {
        const booking = bookingFactory.arrived().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
          {
            text: 'Mark as departed',
            classes: 'govuk-button--secondary',
            href: paths.bookings.departures.new({ premisesId, roomId, bookingId: booking.id }),
          },
          {
            text: 'Extend or shorten booking',
            classes: 'govuk-button--secondary',
            href: paths.bookings.extensions.new({ premisesId, roomId, bookingId: booking.id }),
          },
          changeTurnaroundAction,
        ])
      })

      it('returns edit departed booking for a departed booking', () => {
        const booking = bookingFactory.departed().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
          {
            text: 'Update departure details',
            classes: 'govuk-button--secondary',
            href: paths.bookings.departures.edit({ premisesId, roomId, bookingId: booking.id }),
          },
          changeTurnaroundAction,
        ])
      })

      it('returns edit departed booking for a closed booking', () => {
        const booking = bookingFactory.closed().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
          {
            text: 'Update departure details',
            classes: 'govuk-button--secondary',
            href: paths.bookings.departures.edit({ premisesId, roomId, bookingId: booking.id }),
          },
          changeTurnaroundAction,
        ])
      })

      it('returns edit cancelled booking for a cancelled booking', () => {
        const booking = bookingFactory.cancelled().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).toEqual([
          {
            text: 'Update cancelled booking',
            classes: 'govuk-button--secondary',
            href: paths.bookings.cancellations.edit({ premisesId, roomId, bookingId: booking.id }),
          },
        ])
      })
    })

    describe('when turnarounds are disabled', () => {
      beforeAll(() => {
        config.flags.turnaroundsDisabled = true
      })

      it('does not include a change turn around action', () => {
        const booking = bookingFactory.departed().build({ id: bookingId })

        expect(bookingActions('premisesId', 'roomId', booking)).not.toContainEqual(changeTurnaroundAction)
      })
    })
  })

  describe('statusTag', () => {
    it('returns the HTML formatted display name of a given status', () => {
      expect(statusTag('confirmed')).toEqual('<strong class="govuk-tag govuk-tag--purple">Confirmed</strong>')
    })
  })

  describe('statusName', () => {
    it('returns display name of a given status', () => {
      expect(statusName('confirmed')).toEqual('Confirmed')
    })
  })

  describe('getLatestExtension', () => {
    it('returns undefined when the booking has no extensions', () => {
      const booking = bookingFactory.arrived().build()

      expect(getLatestExtension(booking)).toEqual(undefined)
    })

    it('returns the most recent extension when the booking has extensions', () => {
      const extension1 = extensionFactory.build({
        createdAt: '2022-01-03',
      })
      const extension2 = extensionFactory.build({
        createdAt: '2022-09-23',
      })
      const extension3 = extensionFactory.build({
        createdAt: '2023-04-11',
      })

      const booking = bookingFactory.arrived().build({
        extensions: [extension2, extension3, extension1],
      })

      expect(getLatestExtension(booking)).toEqual(extension3)
    })
  })

  describe('deriveBookingHistory', () => {
    it('derives the booking history of a departed and extended booking', () => {
      const extensions = [
        extensionFactory.build({
          newDepartureDate: '2022-03-03',
          createdAt: '2022-04-01',
        }),

        extensionFactory.build({
          newDepartureDate: '2022-03-04',
          createdAt: '2022-04-02',
        }),

        extensionFactory.build({
          newDepartureDate: '2022-03-05',
          createdAt: '2022-04-03',
        }),
      ]

      const booking = bookingFactory.departed().build({
        originalArrivalDate: '2022-01-01',
        originalDepartureDate: '2022-03-01',
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-06',
        departure: departureFactory.build({
          dateTime: '2022-03-06',
        }),
        extensions: [extensions[2], extensions[0], extensions[1]],
        arrival: arrivalFactory.build({
          arrivalDate: '2022-01-02',
          expectedDepartureDate: '2022-03-02',
        }),
      })

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
            extensions: [],
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
            extensions: [],
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-02',
          },
          updatedAt: booking.arrival.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-03',
          },
          updatedAt: extensions[0].createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0], extensions[1]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-04',
          },
          updatedAt: extensions[1].createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            extensions: [extensions[0], extensions[1], extensions[2]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-05',
          },
          updatedAt: extensions[2].createdAt,
        },
        {
          booking: {
            ...booking,
            extensions: [extensions[0], extensions[1], extensions[2]],
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-06',
          },
          updatedAt: booking.departure.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a departed booking without extensions', () => {
      const booking = bookingFactory.departed().build({
        originalArrivalDate: '2022-01-01',
        originalDepartureDate: '2022-03-01',
        arrivalDate: '2022-01-02',
        departureDate: '2022-03-03',
        departure: departureFactory.build({
          dateTime: '2022-03-03',
        }),
        arrival: arrivalFactory.build({
          arrivalDate: '2022-01-02',
          expectedDepartureDate: '2022-03-02',
        }),
      })

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
            arrivalDate: '2022-01-01',
            departureDate: '2022-03-01',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'arrived',
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-02',
          },
          updatedAt: booking.arrival.createdAt,
        },
        {
          booking: {
            ...booking,
            arrivalDate: '2022-01-02',
            departureDate: '2022-03-03',
          },
          updatedAt: booking.departure.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a cancelled confirmed booking', () => {
      const booking = bookingFactory.cancelled('confirmed').build()

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking: {
            ...booking,
            status: 'confirmed',
          },
          updatedAt: booking.confirmation.createdAt,
        },
        {
          booking,
          updatedAt: booking.cancellation.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })

    it('derives the booking history of a cancelled provisional booking', () => {
      const booking = bookingFactory.cancelled('provisional').build()

      const expected = [
        {
          booking: {
            ...booking,
            status: 'provisional',
          },
          updatedAt: booking.createdAt,
        },
        {
          booking,
          updatedAt: booking.cancellation.createdAt,
        },
      ]

      const result = deriveBookingHistory(booking)

      expect(result).toEqual(expected)
    })
  })

  describe('shortenedOrExtended', () => {
    it("returns 'shortened' for an extension that sets an earlier departure date", () => {
      const extension = extensionFactory.build({
        newDepartureDate: '2021-06-18',
        previousDepartureDate: '2021-06-24',
      })

      expect(shortenedOrExtended(extension)).toEqual('shortened')
    })

    it("returns 'extended' for an extension that sets a later departure date", () => {
      const extension = extensionFactory.build({
        newDepartureDate: '2024-08-01',
        previousDepartureDate: '2024-07-15',
      })

      expect(shortenedOrExtended(extension)).toEqual('extended')
    })

    it("returns 'extended' for an extension that leaves the departure date unchanged", () => {
      const extension = extensionFactory.build({
        newDepartureDate: '2017-11-04',
        previousDepartureDate: '2017-11-04',
      })

      expect(shortenedOrExtended(extension)).toEqual('extended')
    })
  })

  describe('generateConflictBespokeError', () => {
    it('generates a bespoke error when there is a conflicting booking', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, roomId, 'plural')).toEqual({
        errorTitle: 'This bedspace is not available for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.bookings.show({
              premisesId,
              roomId,
              bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error when there is a conflicting lost bed', () => {
      const err = {
        data: {
          detail: `Conflicting Lost Bed: ${lostBedId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, roomId, 'plural')).toEqual({
        errorTitle: 'This bedspace is not available for the dates entered',
        errorSummary: [
          {
            html: `They conflict with an <a href="${paths.lostBeds.show({
              premisesId,
              roomId,
              lostBedId,
            })}">existing void</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error for a single date', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateConflictBespokeError(err as SanitisedError, premisesId, roomId, 'singular')).toEqual({
        errorTitle: 'This bedspace is not available for the date entered',
        errorSummary: [
          {
            html: `It conflicts with an <a href="${paths.bookings.show({
              premisesId,
              roomId,
              bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })
  })

  describe('generateTurnaroundConflictBespokeError', () => {
    it('generates a bespoke error when there is a conflicting booking', () => {
      const err = {
        data: {
          detail: `Conflicting Booking: ${bookingId}`,
        },
      }

      expect(generateTurnaroundConflictBespokeError(err as SanitisedError, premisesId, roomId)).toEqual({
        errorTitle: 'The turnaround time could not be changed',
        errorSummary: [
          {
            html: `The new turnaround time would conflict with an <a href="${paths.bookings.show({
              premisesId,
              roomId,
              bookingId,
            })}">existing booking</a>`,
          },
        ],
      })
    })

    it('generates a bespoke error when there is a conflicting lost bed', () => {
      const err = {
        data: {
          detail: `Conflicting Lost Bed: ${lostBedId}`,
        },
      }

      expect(generateTurnaroundConflictBespokeError(err as SanitisedError, premisesId, roomId)).toEqual({
        errorTitle: 'The turnaround time could not be changed',
        errorSummary: [
          {
            html: `The new turnaround time would conflict with an <a href="${paths.lostBeds.show({
              premisesId,
              roomId,
              lostBedId,
            })}">existing void</a>`,
          },
        ],
      })
    })
  })
})
