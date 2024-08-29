import 'reflect-metadata'
import { FormSections } from '@approved-premises/ui'
import { getFormPages, getFormSections } from '../index'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
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
