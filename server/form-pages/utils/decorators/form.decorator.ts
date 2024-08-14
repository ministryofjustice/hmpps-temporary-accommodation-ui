/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata'
import { FormSections } from '@approved-premises/ui'
import { getFormPages, getFormSections } from '../index'

type Constructor = new (...args: Array<any>) => {}

const Form = (options: { sections: Array<unknown> }) => {
  return <T extends Constructor>(constructor: T) => {
    return class extends constructor {
      static pages = getFormPages(options.sections as FormSections)

      static sections = getFormSections(options.sections as FormSections)
    }
  }
}

export default Form
