import { Request, RequestHandler, Response } from 'express'
import { PageHeadingBarItem } from '@approved-premises/ui'
import type { Cas3NewBedspace, Cas3UpdateBedspace } from '@approved-premises/api'
import AssessmentsService from '../../../../services/assessmentsService'
import extractCallConfig from '../../../../utils/restUtils'
import BedspaceService from '../../../../services/v2/bedspaceService'
import { preservePlaceContext } from '../../../../utils/placeUtils'

import paths from '../../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../../services/v2/premisesService'

import {
  InvalidParams,
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  generateErrorMessages,
  generateErrorSummary,
  generateMergeParameters,
} from '../../../../utils/validation'
// eslint-disable-next-line import/named
import { bedspaceActions, setDefaultStartDate } from '../../../../utils/v2/bedspaceUtils'
import { isPremiseScheduledToBeArchived } from '../../../../utils/v2/premisesUtils'
import { DateFormats, dateIsInFuture } from '../../../../utils/dateUtils'
import { BookingService } from '../../../../services'

export default class BedspacesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
    private readonly bookingService: BookingService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      setDefaultStartDate(userInput)

      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const { characteristics: allCharacteristics } = await this.bedspaceService.getReferenceData(callConfig)
      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)

      const hasScheduledArchive = !!(
        premises.endDate &&
        dateIsInFuture(premises.endDate) &&
        premises.status === 'online'
      )

      return res.render('temporary-accommodation/v2/bedspaces/new', {
        allCharacteristics: allCharacteristics.filter(c => c.propertyName !== 'other'),
        characteristicIds: [],
        premises,
        hasScheduledArchive,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const [premises, bedspace, listingEntries, placeContext] = await Promise.all([
        this.premisesService.getSinglePremisesDetails(callConfig, premisesId),
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.bookingService.getListingEntries(callConfig, premisesId, bedspaceId),
        preservePlaceContext(req, res, this.assessmentService),
      ])

      const summary = this.bedspaceService.summaryList(bedspace)
      const actions: Array<PageHeadingBarItem> = bedspaceActions(premises, bedspace, placeContext)

      return res.render('temporary-accommodation/v2/bedspaces/show', {
        premises,
        bedspace,
        summary,
        actions,
        listingEntries,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { startDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'startDate')
      const newBedspace: Cas3NewBedspace = {
        reference: req.body.reference,
        characteristicIds: req.body.characteristicIds || [],
        startDate,
        notes: req.body.notes,
      }

      try {
        const callConfig = extractCallConfig(req)
        const bedspace = await this.bedspaceService.createBedspace(callConfig, premisesId, newBedspace)

        req.flash('success', 'Bedspace added')
        res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId: bedspace.id }))
      } catch (err) {
        const transform = (params: InvalidParams) => ({
          premisesStartDate: DateFormats.isoDateToUIDate(params.value),
        })

        const mergeVariables = generateMergeParameters(err, [
          { errorType: 'startDateBeforePremisesStartDate', transform },
        ])

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.bedspaces.new({ premisesId }),
          undefined,
          mergeVariables,
        )
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const [premises, bedspace, referenceData] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.bedspaceService.getReferenceData(callConfig),
      ])

      const summary = this.premisesService.shortSummaryList(premises)

      const { characteristics } = referenceData

      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      const { errors, errorSummary } = errorsAndUserInput
      const userInput = {
        reference: bedspace.reference,
        notes: bedspace.notes ?? '',
        characteristicIds: bedspace.characteristics?.map(ch => ch.id) ?? [],
        ...errorsAndUserInput.userInput,
      }

      return res.render('temporary-accommodation/v2/bedspaces/edit', {
        premisesId,
        bedspaceId,
        errors,
        errorSummary,
        characteristics: characteristics.filter(ch => ch.propertyName !== 'other'),
        summary,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const updatedBedspace: Cas3UpdateBedspace = {
        reference: req.body.reference,
        notes: req.body.notes,
        characteristicIds: req.body.characteristicIds ?? [],
      }

      try {
        const bedspace = await this.bedspaceService.updateBedspace(callConfig, premisesId, bedspaceId, updatedBedspace)

        req.flash('success', 'Bedspace edited')
        res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId: bedspace.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.bedspaces.edit({ premisesId, bedspaceId }))
      }
    }
  }

  submitCancelArchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params
      const { bedspaceId: cancelArchive, premisesScheduledForArchive } = req.body

      if (!cancelArchive) {
        const errors = { bedspaceId: 'Select yes if you want to cancel the scheduled archive' }
        req.flash('errors', generateErrorMessages(errors))
        req.flash('errorSummary', generateErrorSummary(errors))
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }))
      }

      try {
        if (cancelArchive === 'yes') {
          await this.bedspaceService.cancelArchiveBedspace(callConfig, premisesId, bedspaceId)
          if (premisesScheduledForArchive === 'true') {
            req.flash('success', 'Bedspace and property archive cancelled')
          } else {
            req.flash('success', 'Bedspace archive cancelled')
          }
        }

        return res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.bedspaces.cancelArchive({ premisesId, bedspaceId }),
        )
      }
    }
  }

  cancelArchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const [bedspace, premiseTotals] = await Promise.all([
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.premisesService.getSinglePremisesBedspaceTotals(callConfig, premisesId),
      ])

      const bedspaceEndDate = DateFormats.isoDateToUIDate(bedspace.endDate)
      const premisesScheduledForArchive = isPremiseScheduledToBeArchived(premiseTotals)

      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      const { errors, errorSummary } = errorsAndUserInput

      return res.render('temporary-accommodation/v2/bedspaces/cancel-archive', {
        premisesId,
        bedspaceId,
        bedspaceEndDate,
        premisesScheduledForArchive,
        errors,
        errorSummary,
      })
    }
  }

  archive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const [bedspace, premises, canArchiveResponse] = await Promise.all([
        this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspaceService.canArchiveBedspace(callConfig, premisesId, bedspaceId).catch((): null => null),
      ])

      if (canArchiveResponse?.date) {
        const blockingDate = DateFormats.isoDateToUIDate(canArchiveResponse.date)
        return res.render('temporary-accommodation/v2/bedspaces/cannot-archive', {
          bedspace,
          premises,
          blockingDate,
          params: req.params,
        })
      }

      return res.render('temporary-accommodation/v2/bedspaces/archive', {
        bedspace,
        params: req.params,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  archiveSubmit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params
      const { archiveOption } = req.body

      const errors: Record<string, string> = {}

      let endDate: string | undefined

      if (archiveOption === 'today') {
        endDate = DateFormats.dateObjToIsoDate(new Date())
      } else if (archiveOption === 'other') {
        const parsedDate = DateFormats.dateAndTimeInputsToIsoString(req.body, 'endDate')
        endDate = parsedDate.endDate
      } else {
        errors.today = 'Select a date to archive the bedspace'
      }

      if (Object.keys(errors).length > 0) {
        req.flash('errors', generateErrorMessages(errors))
        req.flash('errorSummary', generateErrorSummary(errors))
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.bedspaces.archive({ premisesId, bedspaceId }))
      }

      try {
        const allBedspaces = await this.bedspaceService.getBedspacesForPremises(callConfig, premisesId)
        const onlineBedspaces = allBedspaces.bedspaces.filter(bedspace => bedspace.status === 'online')
        const isLastOnlineBedspace = onlineBedspaces.length === 1 && onlineBedspaces[0].id === bedspaceId

        await this.bedspaceService.archiveBedspace(callConfig, premisesId, bedspaceId, endDate)

        const today = DateFormats.dateObjToIsoDate(new Date())
        const isArchived = endDate <= today
        const action = isArchived ? 'archived' : 'updated'
        const target = isLastOnlineBedspace ? 'Bedspace and property' : 'Bedspace'

        const successMessage = `${target} ${action}`

        req.flash('success', successMessage)

        return res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
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
            errorType: 'endDateOverlapPreviousBedspaceArchiveEndDate',
            transform: (params: InvalidParams) => ({
              endDate: DateFormats.isoDateToUIDate(params.value),
            }),
          },
          {
            errorType: 'endDateBeforeBedspaceStartDate',
            transform: (params: InvalidParams) => ({
              startDate: DateFormats.isoDateToUIDate(params.value),
            }),
          },
        ])

        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.bedspaces.archive({ premisesId, bedspaceId }),
          'bedspaceArchive',
          mergeVariables,
        )
      }
    }
  }

  unarchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const bedspace = await this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      return res.render('temporary-accommodation/v2/bedspaces/unarchive', {
        bedspace,
        params: req.params,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  unarchiveSubmit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params
      const { unarchiveOption } = req.body

      const errors: Record<string, string> = {}

      let restartDate: string | undefined

      if (unarchiveOption === 'today') {
        restartDate = DateFormats.dateObjToIsoDate(new Date())
      } else if (unarchiveOption === 'other') {
        const parsedDate = DateFormats.dateAndTimeInputsToIsoString(req.body, 'restartDate')
        restartDate = parsedDate.restartDate
      } else {
        errors.today = 'Select a date for the bedspace to go online'
      }

      if (Object.keys(errors).length > 0) {
        req.flash('errors', generateErrorMessages(errors))
        req.flash('errorSummary', generateErrorSummary(errors))
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.bedspaces.unarchive({ premisesId, bedspaceId }))
      }

      try {
        const allBedspaces = await this.bedspaceService.getBedspacesForPremises(callConfig, premisesId)
        const archivedBedspaces = allBedspaces.bedspaces.filter(bedspace => bedspace.status === 'archived')
        const isLastArchivedBedspace = archivedBedspaces.length === 1 && archivedBedspaces[0].id === bedspaceId

        await this.bedspaceService.unarchiveBedspace(callConfig, premisesId, bedspaceId, restartDate)

        const today = DateFormats.dateObjToIsoDate(new Date())
        const isOnline = restartDate <= today
        const action = isOnline ? 'online' : 'updated'
        const target = isLastArchivedBedspace ? 'Bedspace and property' : 'Bedspace'

        const successMessage = `${target} ${action}`

        req.flash('success', successMessage)

        return res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.bedspaces.unarchive({ premisesId, bedspaceId }),
          'bedspaceUnarchive',
        )
      }
    }
  }

  cancelUnarchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const bedspace = await this.bedspaceService.getSingleBedspace(callConfig, premisesId, bedspaceId)

      const scheduleUnarchiveDate = DateFormats.isoDateToUIDate(bedspace.scheduleUnarchiveDate)

      const errorsAndUserInput = fetchErrorsAndUserInput(req)
      const { errors, errorSummary } = errorsAndUserInput

      return res.render('temporary-accommodation/v2/bedspaces/cancel-unarchive', {
        premisesId,
        bedspaceId,
        scheduleUnarchiveDate,
        errors,
        errorSummary,
      })
    }
  }

  submitCancelUnarchive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params
      const { bedspaceId: cancelUnarchive } = req.body

      if (!cancelUnarchive) {
        const errors = { bedspaceId: 'Select yes if you want to cancel the scheduled online date' }
        req.flash('errors', generateErrorMessages(errors))
        req.flash('errorSummary', generateErrorSummary(errors))
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.bedspaces.cancelUnarchive({ premisesId, bedspaceId }))
      }

      try {
        if (cancelUnarchive === 'yes') {
          await this.bedspaceService.cancelUnarchiveBedspace(callConfig, premisesId, bedspaceId)
          req.flash('success', 'Bedspace online date cancelled')
        }

        return res.redirect(paths.premises.bedspaces.show({ premisesId, bedspaceId }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.bedspaces.cancelUnarchive({ premisesId, bedspaceId }),
        )
      }
    }
  }
}
