import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, PremisesService } from '../../../services'
import ConfirmationService from '../../../services/confirmationService'
import {
  bookingFactory,
  cas3BedspaceFactory,
  confirmationFactory,
  newConfirmationFactory,
  premisesFactory,
} from '../../../testutils/factories'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import ConfirmationsController from './confirmationsController'
import BedspaceService from '../../../services/v2/bedspaceService'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')

describe('ConfirmationsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const bedspaceId = 'bedspaceId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const confirmationService = createMock<ConfirmationService>({})

  const confirmationsController = new ConfirmationsController(
    premisesService,
    bedspaceService,
    bookingService,
    confirmationService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const premises = premisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = bookingFactory.arrived().build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = confirmationsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/confirmations/new', {
        premises,
        bedspace,
        booking,
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('creates a confirmation and redirects to the show booking page', async () => {
      const requestHandler = confirmationsController.create()

      const confirmation = confirmationFactory.build()
      const newConfirmation = newConfirmationFactory.build({
        ...confirmation,
      })

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }
      request.body = {
        ...newConfirmation,
      }

      confirmationService.createConfirmation.mockResolvedValue(confirmation)

      await requestHandler(request, response, next)

      expect(confirmationService.createConfirmation).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        bookingId,
        newConfirmation,
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking confirmed')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = confirmationsController.create()

      const confirmation = confirmationFactory.build()
      const newConfirmation = newConfirmationFactory.build({
        ...confirmation,
      })

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }
      request.body = {
        ...newConfirmation,
      }

      const err = new Error()
      confirmationService.createConfirmation.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.confirmations.new({ premisesId, bedspaceId, bookingId }),
      )
    })
  })
})
