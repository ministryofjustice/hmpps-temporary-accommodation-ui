import type { Response, Request } from 'express'

import type { ErrorMessages, ErrorSummary, ErrorsAndUserInput } from 'approved-premises'
import { SanitisedError } from '../sanitisedError'
import errorLookup from '../i18n/en/errors.json'

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
      [error.propertyName]: {
        text: summaryForError(error).text,
        attributes: {
          [`data-cy-error-${error.propertyName}`]: true,
        },
      },
    }
  }, {})
}

const generateErrorSummary = (params: Array<InvalidParams>): Array<ErrorSummary> => {
  return params.map(obj => summaryForError(obj))
}

const summaryForError = (error: InvalidParams): ErrorSummary => {
  return {
    text: errorLookup[error.propertyName][error.errorType],
    href: `#${error.propertyName}`,
  }
}
