import type { Request, RequestHandler, Response } from 'express'

import { PremisesSearchParameters } from '@approved-premises/ui'
import type { Cas3NewPremises, Cas3PremisesStatus, Cas3UpdatePremises } from '@approved-premises/api'
import paths from '../../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../../services/v2/premisesService'
import BedspaceService from '../../../../services/v2/bedspaceService'
import AssessmentsService from '../../../../services/assessmentsService'
import extractCallConfig from '../../../../utils/restUtils'
import { createSubNavArr } from '../../../../utils/premisesSearchUtils'
import { showPropertySubNavArray } from '../../../../utils/premisesUtils'
import {
  InvalidParams,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateMergeParameters,
} from '../../../../utils/validation'
import { filterProbationRegions } from '../../../../utils/userUtils'
import { parseNumber } from '../../../../utils/formUtils'
import { premisesActions } from '../../../../utils/v2/premisesUtils'
import { DateFormats } from '../../../../utils/dateUtils'
import { preservePlaceContext } from '../../../../utils/placeUtils'

export default class PremisesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  index(status: Cas3PremisesStatus): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const params = req.query as PremisesSearchParameters

      const premisesSortBy = req.session.premisesSortBy || 'pdu'
      const placeContext = await preservePlaceContext(req, res, this.assessmentService)
      const searchData = await this.premisesService.searchDataAndGenerateTableRows(
        callConfig,
        params.postcodeOrAddress,
        placeContext,
        status,
        premisesSortBy,
      )

      return res.render('temporary-accommodation/v2/premises/index', {
        ...searchData,
        params,
        status,
        subNavArr: createSubNavArr(status, placeContext, params.postcodeOrAddress),
        premisesSortBy,
      })
    }
  }

  showPremisesTab(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const [premises, placeContext] = await Promise.all([
        await this.premisesService.getSinglePremises(callConfig, premisesId),
        await preservePlaceContext(req, res, this.assessmentService),
      ])
      const summary = this.premisesService.summaryList(premises)

      return res.render('temporary-accommodation/v2/premises/show', {
        premises,
        summary,
        actions: premisesActions(premises),
        showPremises: true,
        subNavArr: showPropertySubNavArray(premisesId, placeContext, 'premises'),
      })
    }
  }

  showBedspacesTab(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const [premises, bedspaces, placeContext] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.getBedspacesForPremises(callConfig, premisesId),
        await preservePlaceContext(req, res, this.assessmentService),
      ])
      const bedspaceSummaries = bedspaces.bedspaces.map(bedspace => {
        const bedspaceSummary = this.bedspaceService.summaryList(bedspace)
        return {
          id: bedspace.id,
          reference: bedspace.reference,
          summary: bedspaceSummary,
        }
      })

      const subNavArr = showPropertySubNavArray(premisesId, placeContext, 'bedspaces')
      return res.render('temporary-accommodation/v2/premises/show', {
        premises,
        bedspaceSummaries,
        actions: premisesActions(premises),
        showPremises: false,
        subNavArr,
      })
    }
  }

  toggleSort(): RequestHandler {
    return async (req: Request, res: Response) => {
      const currentSort = req.session.premisesSortBy || 'pdu'
      const newSort = currentSort === 'pdu' ? 'la' : 'pdu'

      req.session.premisesSortBy = newSort

      const query = new URLSearchParams(req.query as Record<string, string>).toString()
      const redirectUrl = paths.premises.online() + (query ? `?${query}` : '')

      res.redirect(redirectUrl)
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)

      const { localAuthorities, characteristics, probationRegions, pdus } =
        await this.premisesService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/v2/premises/new', {
        errors,
        errorSummary,
        localAuthorities,
        characteristics: characteristics.filter(ch => ch.propertyName !== 'other'),
        probationRegions: filterProbationRegions(probationRegions, req),
        pdus,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const newPremises: Cas3NewPremises = {
        reference: req.body.reference,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        town: req.body.town,
        postcode: req.body.postcode,
        localAuthorityAreaId: req.body.localAuthorityAreaId,
        probationRegionId: req.body.probationRegionId,
        probationDeliveryUnitId: req.body.probationDeliveryUnitId,
        characteristicIds: req.body.characteristicIds ?? [],
        notes: req.body.notes,
        turnaroundWorkingDays: parseNumber(req.body.turnaroundWorkingDays, { allowNegatives: true }),
      }

      try {
        const callConfig = extractCallConfig(req)
        const premises = await this.premisesService.createPremises(callConfig, newPremises)

        req.flash('success', 'Property added')
        res.redirect(paths.premises.show({ premisesId: premises.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.new())
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const [premises, referenceData] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.premisesService.getReferenceData(callConfig),
      ])

      const { localAuthorities, characteristics, probationRegions, pdus } = referenceData

      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      const { errors, errorSummary } = errorsAndUserInput
      const userInput = {
        reference: premises.reference,
        addressLine1: premises.addressLine1,
        addressLine2: premises.addressLine2,
        town: premises.town,
        postcode: premises.postcode,
        localAuthorityAreaId: premises.localAuthorityArea?.id,
        probationRegionId: premises.probationRegion.id,
        probationDeliveryUnitId: premises.probationDeliveryUnit.id,
        characteristicIds: premises.characteristics?.map(ch => ch.id),
        notes: premises.notes,
        turnaroundWorkingDays: premises.turnaroundWorkingDays,
        ...errorsAndUserInput.userInput,
      }

      const summary = this.premisesService.shortSummaryList(premises)

      return res.render('temporary-accommodation/v2/premises/edit', {
        premisesId,
        errors,
        errorSummary,
        localAuthorities,
        characteristics: characteristics.filter(ch => ch.propertyName !== 'other'),
        probationRegions: filterProbationRegions(probationRegions, req),
        pdus,
        summary,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const updatedPremises: Cas3UpdatePremises = {
        reference: req.body.reference,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        town: req.body.town,
        postcode: req.body.postcode,
        localAuthorityAreaId: req.body.localAuthorityAreaId,
        probationRegionId: req.body.probationRegionId,
        probationDeliveryUnitId: req.body.probationDeliveryUnitId,
        characteristicIds: req.body.characteristicIds ?? [],
        notes: req.body.notes,
        turnaroundWorkingDayCount: parseNumber(req.body.turnaroundWorkingDays, { allowNegatives: true }),
      }

      const { premisesId } = req.params

      try {
        const callConfig = extractCallConfig(req)
        const premises = await this.premisesService.updatePremises(callConfig, premisesId, updatedPremises)

        req.flash('success', 'Property edited')
        res.redirect(paths.premises.show({ premisesId: premises.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.edit({ premisesId }))
      }
    }
  }

  archive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const [premises, blockingBedspaceReferences] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.premisesService.canArchivePremises(callConfig, premisesId),
      ])

      if (blockingBedspaceReferences && blockingBedspaceReferences.items.length > 0) {
        const sortedBedspaceReferences = blockingBedspaceReferences.items.sort((a, b) =>
          a.entityReference.localeCompare(b.entityReference),
        )
        return res.render('temporary-accommodation/v2/premises/cannot-archive', {
          premises,
          bedspaces: sortedBedspaceReferences,
        })
      }

      const archiveOption = userInput.archiveOption || 'today'

      return res.render('temporary-accommodation/v2/premises/archive', {
        premises,
        errors,
        errorSummary,
        ...userInput,
        archiveOption,
      })
    }
  }

  archiveSubmit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params
      const { archiveOption } = req.body

      const errors: Record<string, string> = {}

      let endDate: string | undefined

      if (archiveOption === 'today') {
        endDate = DateFormats.dateObjToIsoDate(new Date())
      } else if (archiveOption === 'other') {
        const parsedDate = DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate')
        endDate = parsedDate.endDate
      } else {
        errors.archiveOption = 'Select a date to archive the premises'
      }

      if (Object.keys(errors).length > 0) {
        req.flash('errors', errors)
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.archive({ premisesId }))
      }

      try {
        await this.premisesService.archivePremises(callConfig, premisesId, { endDate })

        const today = DateFormats.dateObjToIsoDate(new Date())
        req.flash('success', `Property and bedspaces ${endDate > today ? 'updated' : 'archived'}`)

        return res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        const earliestDateTransform = (params: InvalidParams) => ({
          earliestDate: DateFormats.isoDateToUIDate(params.value),
        })

        const mergeVariables = generateMergeParameters(err, [
          { errorType: 'existingUpcomingBedspace', transform: earliestDateTransform },
          { errorType: 'existingBookings', transform: earliestDateTransform },
          { errorType: 'existingVoid', transform: earliestDateTransform },
          { errorType: 'existingTurnaround', transform: earliestDateTransform },
          {
            errorType: 'endDateOverlapPreviousPremisesArchiveEndDate',
            transform: (params: InvalidParams) => ({
              endDate: DateFormats.isoDateToUIDate(params.value),
            }),
          },
        ])

        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.archive({ premisesId }),
          'premisesArchive',
          mergeVariables,
        )
      }
    }
  }

  unarchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const unarchiveOption = userInput.unarchiveOption || 'today'

      return res.render('temporary-accommodation/v2/premises/unarchive', {
        premises,
        errors,
        errorSummary,
        ...userInput,
        unarchiveOption,
      })
    }
  }

  unarchiveSubmit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params
      const { unarchiveOption } = req.body

      const errors: Record<string, string> = {}

      let restartDate: string | undefined

      if (unarchiveOption === 'today') {
        restartDate = DateFormats.dateObjToIsoDate(new Date())
      } else if (unarchiveOption === 'other') {
        const parsedDate = DateFormats.dateAndTimeInputsToIsoString(req.body, 'restartDate')
        restartDate = parsedDate.restartDate
      } else {
        errors.unarchiveOption = 'Select a date for the premises go online'
      }

      if (Object.keys(errors).length > 0) {
        req.flash('errors', errors)
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.unarchive({ premisesId }))
      }

      try {
        await this.premisesService.unarchivePremises(callConfig, premisesId, { restartDate })

        const today = DateFormats.dateObjToIsoDate(new Date())
        req.flash('success', `Property and bedspaces ${restartDate > today ? 'updated' : 'online'}`)

        return res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.unarchive({ premisesId }),
          'premisesUnarchive',
        )
      }
    }
  }
}
