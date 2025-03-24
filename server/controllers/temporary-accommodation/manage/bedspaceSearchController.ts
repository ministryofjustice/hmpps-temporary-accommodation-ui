import type { Request, RequestHandler, Response } from 'express'
import { type Cas3BedspaceSearchParameters, Cas3BedspaceSearchResults } from '../../../@types/shared'
import { ObjectWithDateParts } from '../../../@types/ui'

import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService } from '../../../services'
import { validateSearchQuery } from '../../../utils/bedspaceSearchUtils'
import BedspaceSearchService from '../../../services/bedspaceSearchService'
import { DateFormats } from '../../../utils/dateUtils'
import { parseNumber } from '../../../utils/formUtils'
import { addPlaceContext, preservePlaceContext, updatePlaceContextWithArrivalDate } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, setUserInput } from '../../../utils/validation'

export const DEFAULT_DURATION_DAYS = 84

type BedspaceSearchQuery = ObjectWithDateParts<'startDate'> & {
  probationDeliveryUnits: Array<string>
  durationDays: string
  occupancyAttribute?: string
  accessibilityAttributes?: string[]
}

export default class BedspaceSearchController {
  constructor(
    private readonly searchService: BedspaceSearchService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const placeContext = await preservePlaceContext(req, res, this.assessmentService)
      const callConfig = extractCallConfig(req)

      const {
        pdus: allPdus,
        wheelchairAccessibility,
        occupancy,
        sexualRisk,
      } = await this.searchService.getReferenceData(callConfig)

      const wheelchairAccessibilityItems = wheelchairAccessibility.map(attr => ({
        text: attr.name,
        value: attr.id,
      }))

      const sexualRiskItems = sexualRisk.map(attr => ({
        text: attr.name,
        value: attr.id,
      }))


      const occupancyItems = [
        { text: 'All', value: 'all' },
        ...occupancy.map(attr => ({
          text: attr.name,
          value: attr.id,
        })),
      ]

      const query =
        (req.query as BedspaceSearchQuery).durationDays !== undefined ? (req.query as BedspaceSearchQuery) : undefined

      const placeContextArrivalDate = placeContext?.assessment.accommodationRequiredFromDate
      const startDatePrefill = placeContextArrivalDate
        ? DateFormats.isoToDateAndTimeInputs(placeContextArrivalDate, 'startDate')
        : {}

      let results: Cas3BedspaceSearchResults['results']
      let startDate: string

      try {
        if (query) {
          const validationError = validateSearchQuery(query)

          if (validationError) {
            setUserInput(req, 'get')
            return catchValidationErrorOrPropogate(
              req,
              res,
              validationError,
              addPlaceContext(paths.bedspaces.search({}), placeContext),
              'bedspaceSearch',
            )
          }

          startDate = DateFormats.dateAndTimeInputsToIsoString(
            query as ObjectWithDateParts<'startDate'>,
            'startDate',
          ).startDate

          const durationDays = parseNumber(query.durationDays)

          const selectedAccessibilityIds =
            (req.query.accessibilityAttributes as string[])?.filter(attr =>
              wheelchairAccessibility.some(item => item.id === attr),
            ) ?? []

          let selectedOccupancyAttribute: string[] = []

          if (req.query.occupancyAttribute && req.query.occupancyAttribute !== 'all') {
            selectedOccupancyAttribute = Array.isArray(req.query.occupancyAttribute)
              ? (req.query.occupancyAttribute.filter(attr => typeof attr === 'string') as string[])
              : [req.query.occupancyAttribute as string]
          }

          const bedspaceFilters =
            selectedAccessibilityIds.length > 0 ? { includedCharacteristicIds: selectedAccessibilityIds } : undefined
          
          let includedCharacteristicIds: string[] = []
          let excludedCharacteristicIds: string[] = []

          if(selectedOccupancyAttribute.length > 0){
            includedCharacteristicIds = selectedOccupancyAttribute.filter(attr => typeof attr === 'string')
          }

          if(req.query.sexualRiskAttributes){
            excludedCharacteristicIds = (req.query.sexualRiskAttributes as string[])?.filter(attr => typeof attr === 'string')
          }

          const premisesFilters = {
            includedCharacteristicIds: includedCharacteristicIds,
            excludedCharacteristicIds: excludedCharacteristicIds
          }

          const searchParameters: Cas3BedspaceSearchParameters = {
            ...query,
            startDate,
            durationDays,
            bedspaceFilters,
            premisesFilters,
          }

          results = (await this.searchService.search(callConfig, searchParameters))?.results

          updatePlaceContextWithArrivalDate(res, placeContext, startDate)
        }

        const template = results
          ? 'temporary-accommodation/bedspace-search/results'
          : 'temporary-accommodation/bedspace-search/index'

        return res.render(template, {
          allPdus,
          wheelchairAccessibilityItems,
          occupancyItems,
          sexualRiskItems,
          results,
          startDate,
          errors,
          errorSummary,
          durationDays: req.query.durationDays || DEFAULT_DURATION_DAYS,
          occupancyAttribute: req.query.occupancyAttribute || 'all',
          accessibilityAttributes: req.query.accessibilityAttributes || [],
          ...startDatePrefill,
          ...query,
          ...userInput,
        })
      } catch (err) {
        setUserInput(req, 'get')
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          addPlaceContext(paths.bedspaces.search({}), placeContext),
          'bedspaceSearch',
        )
      }
    }
  }
}
