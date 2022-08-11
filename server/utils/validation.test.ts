import { Request, Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import { SanitisedError } from '../sanitisedError'
import renderWithErrors, { catchValidationErrorOrPropogate } from './validation'
import errorLookups from '../i18n/en/errors.json'

jest.mock('../i18n/en/errors.json', () => {
  return {
    CRN: {
      blank: 'You must enter a CRN',
    },
    arrivalDate: {
      blank: 'You must enter a valid arrival date',
    },
  }
})

describe('renderWithErrors', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()
  const error = createMock<SanitisedError>({
    data: {
      'invalid-params': [
        {
          propertyName: 'CRN',
          errorType: 'blank',
        },
        {
          propertyName: 'arrivalDate',
          errorType: 'blank',
        },
      ],
    },
  })

  const expectedErrors = {
    CRN: { text: errorLookups.CRN.blank, attributes: { 'data-cy-error-CRN': true } },
    arrivalDate: { text: errorLookups.arrivalDate.blank, attributes: { 'data-cy-error-arrivalDate': true } },
  }

  const expectedErrorSummary = [
    { text: errorLookups.CRN.blank, href: '#CRN' },
    { text: errorLookups.arrivalDate.blank, href: '#arrivalDate' },
  ]

  it('renders a template with errors and the request body', () => {
    request.body = {
      some: 'field',
    }

    renderWithErrors(request, response, error, 'some/template')

    expect(response.render).toHaveBeenCalledWith('some/template', {
      errors: expectedErrors,
      errorSummary: expectedErrorSummary,
      ...request.body,
    })
  })

  it('allows additional options to be passed to the render method', () => {
    request.body = {
      some: 'field',
    }

    renderWithErrors(request, response, error, 'some/template', { something: 'else' })

    expect(response.render).toHaveBeenCalledWith('some/template', {
      errors: expectedErrors,
      errorSummary: expectedErrorSummary,
      ...request.body,
      something: 'else',
    })
  })

  it('throws the error if the error is not the type we expect', () => {
    const err = new Error()
    expect(() => renderWithErrors(request, response, err, 'some/template', { something: 'else' })).toThrowError(err)
  })
})

describe('catchValidationErrorOrPropogate', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()
  const error = createMock<SanitisedError>({
    data: {
      'invalid-params': [
        {
          propertyName: 'CRN',
          errorType: 'blank',
        },
        {
          propertyName: 'arrivalDate',
          errorType: 'blank',
        },
      ],
    },
  })

  const expectedErrors = {
    CRN: { text: errorLookups.CRN.blank, attributes: { 'data-cy-error-CRN': true } },
    arrivalDate: { text: errorLookups.arrivalDate.blank, attributes: { 'data-cy-error-arrivalDate': true } },
  }

  const expectedErrorSummary = [
    { text: errorLookups.CRN.blank, href: '#CRN' },
    { text: errorLookups.arrivalDate.blank, href: '#arrivalDate' },
  ]

  it('sets the errors and request body as flash messages and redirects back to the form', () => {
    request.body = {
      some: 'field',
    }

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('throws the error if the error is not the type we expect', () => {
    const err = new Error()
    expect(() => renderWithErrors(request, response, err, 'some/template', { something: 'else' })).toThrowError(err)
  })
})
