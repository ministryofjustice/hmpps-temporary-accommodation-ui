import type { TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class RiskManagementPlanPage extends ApplyPage {
  constructor(application: TemporaryAccommodationApplication) {
    super(
      'Placement considerations',
      application,
      'placement-considerations',
      'risk-management-plan',
      paths.applications.pages.show({
        id: application.id,
        task: 'placement-considerations',
        page: 'rosh-level',
      }),
    )
  }

  completeForm() {
    this.completeTextInputFromPageBody('victimSafetyPlanning')
    this.completeTextInputFromPageBody('supervision')
    this.completeTextInputFromPageBody('monitoringAndControl')
    this.completeTextInputFromPageBody('interventionAndTreatment')
  }
}
