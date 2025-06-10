import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import {
  assessmentFactory,
  bedspaceSearchFormParametersFactory,
  bedspaceSearchResultsFactory,
  placeContextFactory,
  referenceDataFactory,
} from '../../../testutils/factories'
import { DateFormats } from '../../../utils/dateUtils'
import { addPlaceContext, preservePlaceContext, updatePlaceContextWithArrivalDate } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'
import { validateSearchQuery } from '../../../utils/bedspaceSearchUtils'
import BedspaceSearchController, { DEFAULT_DURATION_DAYS } from './bedspaceSearchController'

jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
jest.mock('../../../utils/bedspaceSearchUtils')
jest.mock('../../../utils/placeUtils')

describe('BedspaceSearchController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  const occupancy = [
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-1',
      name: 'Single Occupancy',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-2',
      name: 'Shared Property',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
  ]

  const wheelchairAccessibility = [
    referenceDataFactory.characteristic('room').build({ id: 'accessibility-1', name: 'Wheelchair Accessible' }),
  ]
  const sexualRisk = [
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-3',
      name: 'Risk to adults',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-4',
      name: 'Risk to children',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
  ]

  const gender = [
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-5',
      name: 'Men only',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
    referenceDataFactory.characteristic('premises').build({
      id: 'uuid-6',
      name: 'Women only',
      serviceScope: 'temporary-accommodation',
      modelScope: 'premises',
    }),
  ]

  const referenceData = {
    pdus: referenceDataFactory.pdu().buildList(5),
    wheelchairAccessibility,
    occupancy,
    gender,
    sexualRisk,
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
    ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
    ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(undefined)
    bedspaceSearchService.getReferenceData.mockResolvedValue(referenceData)
    ;(validateSearchQuery as jest.Mock).mockReturnValue(null)
  })

  describe('index', () => {
    describe('when searching', () => {
      it('renders the search form with default values', async () => {
        const requestHandler = bedspaceSearchController.index()

        await requestHandler(request, response, next)

        expect(bedspaceSearchService.getReferenceData).toHaveBeenCalledWith(callConfig)
        expect(bedspaceSearchService.search).not.toHaveBeenCalled()
        expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/index', {
          allPdus: referenceData.pdus,
          wheelchairAccessibilityItems: wheelchairAccessibility.map(attr => ({
            text: attr.name,
            value: attr.id,
          })),
          occupancyItems: [
            { text: 'All', value: 'all' },
            ...occupancy.map(attr => ({ text: attr.name, value: attr.id })),
          ],
          sexualRiskItems: sexualRisk.map(attr => ({ text: attr.name, value: attr.id })),
          occupancyAttribute: 'all',
          accessibilityAttributes: [],
          sexualRiskAttributes: [],
          errors: {},
          errorSummary: [],
          durationDays: DEFAULT_DURATION_DAYS,
        })
      })

      it('prefills the start date if an arrival date is present in a place context', async () => {
        const placeContext = placeContextFactory.build({
          assessment: assessmentFactory.build({
            accommodationRequiredFromDate: '2024-02-01',
          }),
        })

        ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

        const requestHandler = bedspaceSearchController.index()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith(
          'temporary-accommodation/bedspace-search/index',
          expect.objectContaining(DateFormats.isoToDateAndTimeInputs('2024-02-01', 'startDate')),
        )
      })

      it('renders with errors if the API returns an error', async () => {
        const searchParameters = bedspaceSearchFormParametersFactory.build()
        const placeContext = placeContextFactory.build()

        request.query = {
          ...searchParameters,
          durationDays: searchParameters.durationDays.toString(),
          ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
        }

        const err = new Error()
        bedspaceSearchService.search.mockImplementation(() => {
          throw err
        })

        const requestHandler = bedspaceSearchController.index()
        ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)
        ;(addPlaceContext as jest.MockedFunction<typeof addPlaceContext>).mockReturnValue('/path/with/place/context')

        await requestHandler(request, response, next)

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

      it('handles validation errors from validateSearchQuery', async () => {
        const validationError = new Error('validation error')
        ;(validateSearchQuery as jest.Mock).mockReturnValue(validationError)

        request.query = { durationDays: '84' }

        const requestHandler = bedspaceSearchController.index()

        await requestHandler(request, response, next)

        expect(setUserInput).toHaveBeenCalledWith(request, 'get')
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          validationError,
          addPlaceContext(paths.bedspaces.search({}), undefined),
          'bedspaceSearch',
        )
      })
    })

    describe('when showing results', () => {
      it('renders the search results page with search results when given a search query', async () => {
        const searchParameters = bedspaceSearchFormParametersFactory.build()

        request.query = {
          ...searchParameters,
          durationDays: searchParameters.durationDays.toString(),
          ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
        }

        const searchResults = bedspaceSearchResultsFactory.build()

        bedspaceSearchService.search.mockResolvedValue(searchResults)

        const requestHandler = bedspaceSearchController.index()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bedspace-search/results', {
          ...request.query,
          allPdus: referenceData.pdus,
          wheelchairAccessibilityItems: wheelchairAccessibility.map(attr => ({
            text: attr.name,
            value: attr.id,
          })),
          occupancyItems: [
            { text: 'All', value: 'all' },
            ...occupancy.map(attr => ({ text: attr.name, value: attr.id })),
          ],
          sexualRiskItems: sexualRisk.map(attr => ({ text: attr.name, value: attr.id })),
          occupancyAttribute: 'all',
          accessibilityAttributes: [],
          sexualRiskAttributes: [],
          results: searchResults.results,
          errors: {},
          errorSummary: [],
        })
      })

      it('updates the place context when given a search query', async () => {
        const searchParameters = bedspaceSearchFormParametersFactory.build()
        const placeContext = placeContextFactory.build()

        request.query = {
          ...searchParameters,
          durationDays: searchParameters.durationDays.toString(),
          ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
        }

        const searchResults = bedspaceSearchResultsFactory.build()

        bedspaceSearchService.search.mockResolvedValue(searchResults)
        ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

        const requestHandler = bedspaceSearchController.index()

        await requestHandler(request, response, next)

        expect(updatePlaceContextWithArrivalDate).toHaveBeenCalledWith(
          response,
          placeContext,
          searchParameters.startDate,
        )
      })
    })

    it('applies filters correctly when given a search query', async () => {
      const searchParameters = bedspaceSearchFormParametersFactory.build()
      const placeContext = placeContextFactory.build()

      request.query = {
        ...searchParameters,
        durationDays: searchParameters.durationDays.toString(),
        ...DateFormats.isoToDateAndTimeInputs(searchParameters.startDate, 'startDate'),
        accessibilityAttributes: ['accessibility-1', 'invalid-accessibility'],
        occupancyAttribute: ['uuid-1', null, 'uuid-2'],
        sexualRiskAttributes: ['uuid-3', null, 'uuid-4'],
      }

      const searchResults = bedspaceSearchResultsFactory.build()

      bedspaceSearchService.search.mockResolvedValue(searchResults)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

      const requestHandler = bedspaceSearchController.index()

      await requestHandler(request, response, next)

      expect(bedspaceSearchService.search).toHaveBeenCalledWith(
        callConfig,
        expect.objectContaining({
          bedspaceFilters: { includedCharacteristicIds: ['accessibility-1'] },
          premisesFilters: {
            includedCharacteristicIds: ['uuid-1', 'uuid-2'],
            excludedCharacteristicIds: ['uuid-3', 'uuid-4'],
          },
        }),
      )
    })
  })
})
