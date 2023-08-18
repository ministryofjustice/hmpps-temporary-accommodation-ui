import Page from './page'

export default class UnAuthorisedPage extends Page {
  constructor() {
    super('You do not have permission to complete this action')
  }
}
