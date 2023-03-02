import type { Request, Response } from 'express'
import jsonpath from 'jsonpath'

import type { ErrorMessage, ErrorMessages, ErrorSummary, ErrorsAndUserInput } from '@approved-premises/ui'
import errorLookup from '../i18n/en/errors.json'
import { SanitisedError } from '../sanitisedError'
import { TasklistAPIError, ValidationError } from './errors'

interface InvalidParams {
  propertyName: string
  errorType: string
}

export const catchValidationErrorOrPropogate = (
  request: Request,
  response: Response,
  error: SanitisedError | Error,
  redirectPath: string,
  context = 'generic',
): void => {
  const errors = extractValidationErrors(error, context)

  const errorMessages = generateErrorMessages(errors)
  const errorSummary = generateErrorSummary(errors)

  request.flash('errors', errorMessages)
  request.flash('errorSummary', errorSummary)
  request.flash('userInput', request.body)

  response.redirect(redirectPath)
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

export const setUserInput = (request: Request): void => {
  request.flash('userInput', request.body)
}

export const errorSummary = (field: string, text: string): ErrorSummary => {
  return {
    text,
    href: `#${field}`,
  }
}

export const errorMessage = (field: string, text: string): ErrorMessage => {
  return {
    text,
    attributes: {
      [`data-cy-error-${field}`]: true,
    },
  }
}

export const insertGenericError = (error: SanitisedError | Error, propertyName: string, errorType: string): void => {
  const data = 'data' in error ? error.data : {}
  const invalidParams = (data['invalid-params'] ? data['invalid-params'] : []) as Array<Record<string, string>>

  invalidParams.push({
    propertyName: `$.${propertyName}`,
    errorType,
  })

  data['invalid-params'] = invalidParams
  // eslint-disable-next-line dot-notation
  error['data'] = data
}

const extractValidationErrors = (error: SanitisedError | Error, context: string) => {
  if ('data' in error) {
    if (error.data['invalid-params'] && error.data['invalid-params'].length) {
      return generateErrors(error.data['invalid-params'], context)
    }
    if (error instanceof ValidationError) {
      return error.data as Record<string, string>
    }
  }

  throw error
}

const generateErrors = (params: Array<InvalidParams>, context: string): Record<string, string> => {
  return params.reduce((obj, error) => {
    const key = error.propertyName.split('.').slice(1).join('_')
    return {
      ...obj,
      [key]: errorText(error, context),
    }
  }, {})
}

const generateErrorSummary = (errors: Record<string, string>): Array<ErrorSummary> => {
  return Object.keys(errors).map(k => errorSummary(k, errors[k]))
}

const firstFlashItem = (request: Request, key: string) => {
  const message = request.flash(key)
  return message ? message[0] : undefined
}

const generateErrorMessages = (errors: Record<string, string>): ErrorMessages => {
  return Object.keys(errors).reduce((obj, key) => {
    return {
      ...obj,
      [key]: errorMessage(key, errors[key]),
    }
  }, {})
}

const errorText = (error: InvalidParams, context: string): ErrorSummary => {
  const errors =
    jsonpath.value(errorLookup[context], error.propertyName) ||
    throwUndefinedError(`Cannot find a translation for an error at the path ${error.propertyName}`)

  const text =
    errors[error.errorType] ||
    throwUndefinedError(
      `Cannot find a translation for an error at the path ${error.propertyName} with the type ${error.errorType}`,
    )

  return text
}

const throwUndefinedError = (message: string) => {
  throw new Error(message)
}
