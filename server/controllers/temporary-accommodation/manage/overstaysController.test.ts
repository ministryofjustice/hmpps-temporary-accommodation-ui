import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import { BookingService, OverstaysService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import OverstaysController from './overstaysController'
import extractCallConfig from '../../../utils/restUtils'
import {
  cas3BedspaceFactory,
  cas3BookingFactory,
  cas3NewOverstayFactory,
  cas3OverstayFactory,
  cas3PremisesFactory,
} from '../../../testutils/factories'
import { nightsBetween } from '../../../utils/dateUtils'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate } from '../../../utils/validation'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/restUtils')

describe('OverstaysController', () => {
  const callConfig = { token: 'some-token' } as CallConfig

  let request: Request
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const overstaysService = createMock<OverstaysService>({})

  const overstaysController = new OverstaysController(
    premisesService,
    bedspaceService,
    bookingService,
    overstaysService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = cas3BookingFactory.build()
      const newOverstay = cas3NewOverstayFactory.build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      request.query = { newDepartureDate: newOverstay.newDepartureDate }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = overstaysController.new()

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      const expectedNightsOverLimit = nightsBetween(booking.arrivalDate, newOverstay.newDepartureDate) - 84

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/overstays/new', {
        premises,
        bedspace,
        booking,
        newDepartureDate: newOverstay.newDepartureDate,
        nightsOverLimit: expectedNightsOverLimit,
      })
    })
  })

  describe('create', () => {
    const premisesId = '3599f277-e16f-484f-b9a9-fa86b60dab4b'
    const bedspaceId = '688731e6-e514-4081-970a-9cd70348c96f'
    const bookingId = 'e3166cf1-629a-4a00-8d29-8668b5bd4f14'

    it('creates an overstay and redirects to the show booking page', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3OverstayFactory.build()
      const newOverstay = cas3NewOverstayFactory.build({
        newDepartureDate: overstay.newDepartureDate,
        isAuthorised: overstay.isAuthorised,
        reason: overstay.reason,
      })

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }

      request.body = {
        newDepartureDate: newOverstay.newDepartureDate,
        reason: newOverstay.reason,
        isAuthorised: newOverstay.isAuthorised ? 'yes' : 'no',
      }

      overstaysService.createOverstay.mockResolvedValue(overstay)

      await requestHandler(request, response, next)

      expect(overstaysService.createOverstay).toHaveBeenCalledWith(callConfig, premisesId, bookingId, newOverstay)

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking departure date changed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
    })

    it('redirects to the booking extension page with errors if the API returns an error', async () => {
      const requestHandler = overstaysController.create()

      const overstay = cas3NewOverstayFactory.build()

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }

      request.body = { ...overstay }

      const err = new Error()
      overstaysService.createOverstay.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.extensions.new({ premisesId, bedspaceId, bookingId }),
      )
    })
  })
})
