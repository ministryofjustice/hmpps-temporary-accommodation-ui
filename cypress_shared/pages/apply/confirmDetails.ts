import type { Person } from '@approved-premises/api'

import PersonDetailsComponent from '../../components/personDetails'
import Page from '../page'

export default class ConfirmDetailsPage extends Page {
  private readonly personDetailsComponent: PersonDetailsComponent

  constructor(private person: Person) {
    super(`Confirm ${person.name}'s details`)

    this.personDetailsComponent = new PersonDetailsComponent(person)
  }

  shouldPersonDetails(): void {
    this.personDetailsComponent.shouldShowPersonDetails()
  }
}
