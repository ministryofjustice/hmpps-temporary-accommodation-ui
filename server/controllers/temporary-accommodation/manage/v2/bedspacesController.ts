import { Request, RequestHandler, Response } from 'express'
import { PageHeadingBarItem } from '@approved-premises/ui'
import type { Cas3NewBedspace } from '@approved-premises/api'
import extractCallConfig from '../../../../utils/restUtils'
import BedspaceService from '../../../../services/v2/bedspaceService'

import paths from '../../../../paths/temporary-accommodation/manage'
import PremisesService from '../../../../services/v2/premisesService'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../../utils/validation'
import { DateFormats, dateAndTimeInputsAreValidDates, dateIsBlank } from '../../../../utils/dateUtils'

export default class BedspacesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspaceService: BedspaceService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const callConfig = extractCallConfig(req)
      const { premisesId } = req.params

      const { characteristics: allCharacteristics } = await this.bedspaceService.getReferenceData(callConfig)
      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)

      return res.render('temporary-accommodation/v2/bedspaces/new', {
        allCharacteristics,
        characteristicIds: [],
        premises,
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

      const bedspace = await this.bedspaceService.getSingleBedspaceDetails(callConfig, premisesId, bedspaceId)
      const premises = await this.premisesService.getSinglePremisesDetails(callConfig, premisesId)
      const actions: Array<PageHeadingBarItem> = []

      if (bedspace.status !== 'archived') {
        actions.push({
          text: 'Archive',
          classes: 'govuk-button--secondary moj-button-menu__item',
          href: paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
        })
      }

      return res.render('temporary-accommodation/v2/bedspaces/show', { premises, bedspace, actions })
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

        req.flash('success', 'Bedspace created')
        res.redirect(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId: bedspace.id }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.premises.v2.bedspaces.new({ premisesId }))
      }
    }
  }

  archive(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)
      const callConfig = extractCallConfig(req)
      const { premisesId, bedspaceId } = req.params

      const bedspace = await this.bedspaceService.getSingleBedspaceDetails(callConfig, premisesId, bedspaceId)

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
      const { premisesId, bedspaceId } = req.params
      const { archiveOption } = req.body

      const errors: Record<string, string> = {}

      let archiveDate: string | undefined

      if (archiveOption === 'today') {
        archiveDate = DateFormats.dateObjToIsoDate(new Date())
      } else if (archiveOption === 'anotherDate') {
        if (dateIsBlank(req.body, 'archiveDate')) {
          errors.archiveDate = 'You must specify the archive date'
        } else if (!dateAndTimeInputsAreValidDates(req.body, 'archiveDate')) {
          errors.archiveDate = 'You must specify a valid archive date'
        } else {
          const { archiveDate: archiveDateString } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'archiveDate')
          archiveDate = archiveDateString
        }
      } else {
        errors.archiveOption = 'You must select when to archive the bedspace'
      }

      if (Object.keys(errors).length > 0) {
        req.flash('errors', errors)
        req.flash('userInput', req.body)
        return res.redirect(paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }))
      }

      if (!archiveDate) {
        return res.redirect(paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }))
      }

      try {
        const callConfig = extractCallConfig(req)
        await this.bedspaceService.archiveBedspace(callConfig, premisesId, bedspaceId, archiveDate)

        req.flash('success', 'Bedspace archived')
        return res.redirect(paths.premises.v2.bedspaces.show({ premisesId, bedspaceId }))
      } catch (err) {
        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.premises.v2.bedspaces.archive({ premisesId, bedspaceId }),
          'bedspaceArchive',
        )
      }
    }
  }
}
