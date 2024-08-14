import type { Request, Response } from 'express'
import jsonpath from 'jsonpath'

import type { BespokeError, ErrorMessage, ErrorMessages, ErrorSummary, ErrorsAndUserInput } from '@approved-premises/ui'
import errorLookup from '../i18n/en/errors.json'
import { SanitisedError } from '../sanitisedError'
import { TasklistAPIError, ValidationError } from './errors'
import { FlashMessage } from '../@types/express'

interface InvalidParams {
  propertyName: string
  errorType: string
}

interface AnnotatedError extends Error {
  data?: { 'invalid-params'?: Array<InvalidParams>; bespokeError?: BespokeError } | Record<string, string>
}

type ErrorContext = keyof typeof errorLookup

export const catchValidationErrorOrPropogate = (
  request: Request,
  response: Response,
  error: SanitisedError | Error,
  redirectPath: string,
  context: ErrorContext = 'generic',
): void => {
  const bespokeError = (isAnnotatedError(error) && (error.data.bespokeError as BespokeError)) || undefined

  const errors = extractValidationErrors(error, context)
  const errorMessages = generateErrorMessages(errors)
  const errorSummary = bespokeError?.errorSummary || generateErrorSummary(errors)
  const errorTitle = bespokeError?.errorTitle

  request.flash('errors', errorMessages)
  request.flash('errorSummary', errorSummary)
  if (errorTitle) {
    request.flash('errorTitle', errorTitle)
  }
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
  const errors = (firstFlashItem(request, 'errors') as ErrorMessages) || {}
  const errorSummary = (request.flash('errorSummary') || []) as Array<ErrorSummary>
  const errorTitle = firstFlashItem(request, 'errorTitle') as string
  const userInput = (firstFlashItem(request, 'userInput') as Record<string, unknown>) || {}

  return { errors, errorSummary, errorTitle, userInput }
}

export const setUserInput = (request: Request, source: 'get' | 'post' = 'post'): void => {
  request.flash('userInput', source === 'post' ? request.body : request.query)
}

export const clearUserInput = (request: Request): void => {
  request.flash('userInput', null)
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
  const data = ('data' in error ? error.data : {}) as AnnotatedError['data']
  const invalidParams = (data['invalid-params'] ? data['invalid-params'] : []) as Array<InvalidParams>

  invalidParams.push({
    propertyName: `$.${propertyName}`,
    errorType,
  })

  data['invalid-params'] = invalidParams
  ;(error as AnnotatedError).data = data
}

export const insertBespokeError = (error: SanitisedError | Error, bespokeError: BespokeError): void => {
  const data = ('data' in error ? error.data : {}) as AnnotatedError['data']
  data.bespokeError = bespokeError
  ;(error as AnnotatedError).data = data
}

const extractValidationErrors = (error: SanitisedError | Error, context: ErrorContext) => {
  if (isAnnotatedError(error)) {
    if (error.data['invalid-params'] && error.data['invalid-params'].length) {
      return generateErrors(error.data['invalid-params'] as Array<InvalidParams>, context)
    }
    if (error instanceof ValidationError) {
      return error.data as Record<string, string>
    }
  }

  throw error
}

export const transformErrors = (error: SanitisedError | Error, source: string, destination: string) => {
  if (isAnnotatedError(error)) {
    const invalidParams = error.data['invalid-params'] as Array<InvalidParams>

    if (
      invalidParams?.some(element => {
        return element.propertyName === `$.${destination}`
      })
    ) {
      return
    }

    invalidParams?.forEach(element => {
      if (element.propertyName === `$.${source}`) {
        element.propertyName = `$.${destination}`
      }
    })
  }
}

const generateErrors = (params: Array<InvalidParams>, context: ErrorContext): Record<string, string> => {
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

const firstFlashItem = (request: Request, key: string): FlashMessage => {
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

const errorText = (error: InvalidParams, context: ErrorContext): ErrorSummary => {
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

const isAnnotatedError = (error: SanitisedError | Error): error is AnnotatedError => {
  return 'data' in error
}
