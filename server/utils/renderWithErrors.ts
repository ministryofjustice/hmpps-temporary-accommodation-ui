import type { Response, Request } from 'express'

import type { ErrorMessages, ErrorSummary } from 'approved-premises'
import { SanitisedError } from '../sanitisedError'
import errorLookup from '../i18n/en/errors.json'

interface InvalidParams {
  propertyName: string
  errorType: string
}

export default function renderWithErrors(
  request: Request,
  response: Response,
  error: SanitisedError | Error,
  template: string,
  options: Record<string, unknown> = {},
): void {
  if ('data' in error) {
    const invalidParams = error.data['invalid-params']
    const errors = generateErrorMessages(invalidParams)
    const errorSummary = generateErrorSummary(invalidParams)

    response.render(template, { errors, errorSummary, ...options, ...request.body })
  } else {
    throw error
  }
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
