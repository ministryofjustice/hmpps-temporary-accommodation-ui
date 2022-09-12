import type { Response, Request } from 'express'

import type { ErrorMessage, ErrorMessages, ErrorSummary, ErrorsAndUserInput } from 'approved-premises'
import { SanitisedError } from '../sanitisedError'
import errorLookup from '../i18n/en/errors.json'
import { TasklistAPIError } from './errors'

interface InvalidParams {
  propertyName: string
  errorType: string
}

export const catchValidationErrorOrPropogate = (
  request: Request,
  response: Response,
  error: SanitisedError | Error,
  redirectPath: string,
): void => {
  if ('data' in error) {
    const invalidParams = error.data['invalid-params'] || error.data
    const errors = generateErrorMessages(invalidParams)
    const errorSummary = generateErrorSummary(invalidParams)

    request.flash('errors', errors)
    request.flash('errorSummary', errorSummary)
    request.flash('userInput', request.body)

    response.redirect(redirectPath)
  } else {
    throw error
  }
}

export const catchAPIErrorOrPropogate = (request: Request, response: Response, error: SanitisedError | Error): void => {
  if (error instanceof TasklistAPIError) {
    request.flash('errors', {
      crn: errorMessage(error.field, error.message),
    })
    request.flash('errorSummary', [errorSummary(error.field, error.message)])

    response.redirect(request.headers.referer)
  } else {
    throw error
  }
}

export const fetchErrorsAndUserInput = (request: Request): ErrorsAndUserInput => {
  const errors = firstFlashItem(request, 'errors') || {}
  const errorSummary = request.flash('errorSummary') || []
  const userInput = firstFlashItem(request, 'userInput') || {}

  return { errors, errorSummary, userInput }
}

const firstFlashItem = (request: Request, key: string) => {
  const message = request.flash(key)
  return message ? message[0] : undefined
}

const generateErrorMessages = (params: Array<InvalidParams>): ErrorMessages => {
  return params.reduce((obj, error) => {
    return {
      ...obj,
      [error.propertyName]: errorMessage(error.propertyName, summaryForError(error).text),
    }
  }, {})
}

const generateErrorSummary = (params: Array<InvalidParams>): Array<ErrorSummary> => {
  return params.map(obj => summaryForError(obj))
}

const summaryForError = (error: InvalidParams): ErrorSummary => {
  return errorSummary(error.propertyName, errorLookup[error.propertyName][error.errorType])
}

const errorSummary = (field: string, text: string): ErrorSummary => {
  return {
    text,
    href: `#${field}`,
  }
}

const errorMessage = (field: string, text: string): ErrorMessage => {
  return {
    text,
    attributes: {
      [`data-cy-error-${field}`]: true,
    },
  }
}
