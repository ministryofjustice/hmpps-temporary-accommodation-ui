import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { bedSearchParametersFactory, bedSearchResultsFactory, referenceDataFactory } from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'
import BedspaceSearchController from './bedspaceSearchController'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')

describe('BedspaceSearchController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const referenceData = {
    pdus: referenceDataFactory.pdu().buildList(5),
  }

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bedspaceSearchService = createMock<BedspaceSearchService>({})

  const bedspaceSearchController = new BedspaceSearchController(bedspaceSearchService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('index', () => {
    it('renders the search page when not given a search query', async () => {
      request.query = {}

      bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)

      const requestHandler = bedspaceSearchController.index()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith()
      expect(bedspaceSearchService.search).not.toHaveBeenCalled()

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/index', {
        allPdus: referenceData.pdus,
        errors: {},
        errorSummary: [],
      })
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

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith()
      expect(bedspaceSearchService.search).toHaveBeenCalledWith(callConfig, expect.objectContaining(searchParameters))

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/index', {
        allPdus: referenceData.pdus,
        results: searchResults,
        errors: {},
        errorSummary: [],
        ...request.query,
      })
    })

    it('renders with errors if the API returns an error', async () => {
      const searchParameters = bedSearchParametersFactory.build()

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

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith()
      expect(bedspaceSearchService.search).toHaveBeenCalledWith(callConfig, expect.objectContaining(searchParameters))

      expect(setUserInput).toHaveBeenCalledWith(request.query, 'get')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, paths.bedspaces.search({}))
    })
  })
})
