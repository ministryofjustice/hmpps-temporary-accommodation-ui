import type { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class ExamplePage extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Example page', application, 'example-task', 'example-page')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('exampleAnswer')
  }
}
