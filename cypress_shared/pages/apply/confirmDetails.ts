import type { Person } from '@approved-premises/api'

import PersonDetailsComponent from '../../components/personDetails'
import Page from '../page'
import { personName } from '../../../server/utils/personUtils'

export default class ConfirmDetailsPage extends Page {
  private readonly personDetailsComponent: PersonDetailsComponent

  constructor(private person: Person) {
    super(`Confirm ${personName(person)}'s details`)

    this.personDetailsComponent = new PersonDetailsComponent(person)
  }

  shouldPersonDetails(): void {
    this.personDetailsComponent.shouldShowPersonDetails()
  }
}
