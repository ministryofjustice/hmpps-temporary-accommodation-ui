import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import {
  applicationFactory,
  assessmentFactory,
  bedSearchParametersFactory,
  bedSearchResultsFactory,
  placeContextFactory,
  referenceDataFactory,
} from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import { addPlaceContext, preservePlaceContext, updatePlaceContextWithArrivalDate } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'
import BedspaceSearchController, { DEFAULT_DURATION_DAYS } from './bedspaceSearchController'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
jest.mock('../../../utils/placeUtils')

describe('BedspaceSearchController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const referenceData = {
    pdus: referenceDataFactory.pdu().buildList(5),
  }

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceSearchService = createMock<BedspaceSearchService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const bedspaceSearchController = new BedspaceSearchController(bedspaceSearchService, assessmentService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    it('renders the search page with default duration when not given a search query', async () => {
      request.query = {
        'other-parameter': 'other-data',
      }

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceSearchService.search).not.toHaveBeenCalled()
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/index', {
        allPdus: referenceData.pdus,
        errors: {},
        errorSummary: [],
        durationDays: DEFAULT_DURATION_DAYS,
      })
    })

    it('prefills the start date if an arrival date is present in a place context', async () => {
      request.query = {}
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          application: applicationFactory.build({
            arrivalDate: '2024-02-01',
          }),
        }),
      })

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceSearchService.search).not.toHaveBeenCalled()
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)

      expect(response.render).toHaveBeenCalledWith(
        'temporary-accommodation/bedspace-search/index',
        expect.objectContaining(DateFormats.isoToDateAndTimeInputs('2024-02-01', 'startDate')),
      )
    })

    it('renders the search page with search results when given a search query', async () => {
      const searchParameters = bedSearchParametersFactory.build()

      request.query = {
        ...searchParameters,
        durationDays: searchParameters.durationDays.toString(),
        ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
      } as Record<string, string>

      const searchResults = bedSearchResultsFactory.build()

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)
      bedspaceSearchService.search.mockResolvedValue(searchResults)

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceSearchService.search).toHaveBeenCalledWith(callConfig, expect.objectContaining(searchParameters))
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/index', {
        allPdus: referenceData.pdus,
        results: searchResults,
        errors: {},
        errorSummary: [],
        ...request.query,
      })
    })

    it('updates the place context when given a search query', async () => {
      const searchParameters = bedSearchParametersFactory.build()
      const placeContext = placeContextFactory.build()

      request.query = {
        ...searchParameters,
        durationDays: searchParameters.durationDays.toString(),
        ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
      } as Record<string, string>

      const searchResults = bedSearchResultsFactory.build()

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)
      bedspaceSearchService.search.mockResolvedValue(searchResults)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(updatePlaceContextWithArrivalDate).toHaveBeenCalledWith(response, placeContext, searchParameters.startDate)
    })

    it('renders with errors if the API returns an error', async () => {
      const searchParameters = bedSearchParametersFactory.build()
      const placeContext = placeContextFactory.build()

      request.query = {
        ...searchParameters,
        durationDays: searchParameters.durationDays.toString(),
        ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
      } as Record<string, string>

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)

      const err = new Error()
      bedspaceSearchService.search.mockImplementation(() => {
        throw err
      })

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)
      ;(addPlaceContext as jest.MockedFunction<typeof addPlaceContext>).mockReturnValue('/path/with/place/context')

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(bedspaceSearchService.search).toHaveBeenCalledWith(callConfig, expect.objectContaining(searchParameters))
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
      expect(addPlaceContext).toHaveBeenCalledWith(paths.bedspaces.search({}), placeContext)

      expect(setUserInput).toHaveBeenCalledWith(request.query, 'get')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        '/path/with/place/context',
        'bedspaceSearch',
      )
    })
  })
})
