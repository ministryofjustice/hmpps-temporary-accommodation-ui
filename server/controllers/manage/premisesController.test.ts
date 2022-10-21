import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { SummaryListItem, GroupedListofBookings, TableRow } from '@approved-premises/ui'
import PremisesService from '../../services/premisesService'
import BookingService from '../../services/bookingService'
import PremisesController from './premisesController'

describe('PremisesController', () => {
  const token = 'SOME_TOKEN'

  const request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bookingService = createMock<BookingService>({})
  const premisesController = new PremisesController(premisesService, bookingService)

  describe('index', () => {
    it('should return the table rows to the template', async () => {
      premisesService.approvedPremisesTableRows.mockResolvedValue([])

      const requestHandler = premisesController.index()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/index', { tableRows: [] })

      expect(premisesService.approvedPremisesTableRows).toHaveBeenCalledWith(token)
    })
  })

  describe('show', () => {
    it('should return the premises detail to the template', async () => {
      const premises = { name: 'Some premises', summaryList: { rows: [] as Array<SummaryListItem> } }
      const bookings = createMock<GroupedListofBookings>()
      const currentResidents = createMock<Array<TableRow>>()
      const overcapacityMessage = 'The premises is over capacity for the period January 1st 2023 to Feburary 3rd 2023'
      premisesService.getApprovedPremisesPremisesDetails.mockResolvedValue(premises)
      premisesService.getOvercapacityMessage.mockResolvedValue([overcapacityMessage])
      bookingService.groupedListOfBookingsForPremisesId.mockResolvedValue(bookings)
      bookingService.currentResidents.mockResolvedValue(currentResidents)

      request.params.premisesId = 'some-uuid'

      const requestHandler = premisesController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('premises/show', {
        premisesId: 'some-uuid',
        premises,
        bookings,
        currentResidents,
        infoMessages: [overcapacityMessage],
      })

      expect(premisesService.getApprovedPremisesPremisesDetails).toHaveBeenCalledWith(token, 'some-uuid')
      expect(bookingService.groupedListOfBookingsForPremisesId).toHaveBeenCalledWith(token, 'some-uuid')
      expect(bookingService.currentResidents).toHaveBeenCalledWith(token, 'some-uuid')
    })
  })
})
