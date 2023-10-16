/* istanbul ignore file */

import type { Router } from 'express'
import type { Controllers } from '../../controllers'
import { createUserCheckMiddleware, userIsAuthorisedForManage } from '../../middleware/userCheckMiddleware'
import paths from '../../paths/temporary-accommodation/manage'
import { Services } from '../../services'
import { actions, compose } from '../utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { get, post, put } = compose(
    actions(router, services.auditService),
    createUserCheckMiddleware(userIsAuthorisedForManage),
  )

  const {
    dashboardController,
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
    turnaroundsController,
    reportsController,
    lostBedsController,
    bedspaceSearchController,
    bookingSearchController,
    assessmentsController,
  } = controllers.manage

  get(paths.dashboard.index.pattern, dashboardController.index(), { auditEvent: 'VIEW_DASHBOARD' })

  get(paths.premises.index.pattern, premisesController.index(), { auditEvent: 'VIEW_PREMISES_LIST' })
  get(paths.premises.new.pattern, premisesController.new(), { auditEvent: 'VIEW_PREMISES_CREATE' })
  post(paths.premises.create.pattern, premisesController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.premises.new.pattern,
        auditEvent: 'CREATE_PREMISES_FAILURE',
      },
      {
        path: paths.premises.show.pattern,
        auditEvent: 'CREATE_PREMISES_SUCCESS',
      },
    ],
  })
  get(paths.premises.edit.pattern, premisesController.edit(), { auditEvent: 'VIEW_PREMISES_EDIT' })
  put(paths.premises.update.pattern, premisesController.update(), {
    redirectAuditEventSpecs: [
      {
        path: paths.premises.edit.pattern,
        auditEvent: 'EDIT_BEDSPACE_FAILURE',
      },
      {
        path: paths.premises.show.pattern,
        auditEvent: 'EDIT_BEDSPACE_SUCCESS',
      },
    ],
  })
  get(paths.premises.show.pattern, premisesController.show(), { auditEvent: 'VIEW_PREMISES' })

  get(paths.premises.bedspaces.new.pattern, bedspacesController.new(), { auditEvent: 'VIEW_BEDSPACE_CREATE' })
  post(paths.premises.bedspaces.create.pattern, bedspacesController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.premises.bedspaces.new.pattern,
        auditEvent: 'CREATE_BEDSPACE_FAILURE',
      },
      {
        path: paths.premises.bedspaces.show.pattern,
        auditEvent: 'CREATE_BEDSPACE_SUCCESS',
      },
    ],
  })
  get(paths.premises.bedspaces.edit.pattern, bedspacesController.edit(), { auditEvent: 'VIEW_BEDSPACE_EDIT' })
  put(paths.premises.bedspaces.update.pattern, bedspacesController.update(), {
    redirectAuditEventSpecs: [
      {
        path: paths.premises.bedspaces.edit.pattern,
        auditEvent: 'EDIT_BEDSPACE_FAILURE',
      },
      {
        path: paths.premises.bedspaces.show.pattern,
        auditEvent: 'EDIT_BEDSPACE_SUCCESS',
      },
    ],
  })
  get(paths.premises.bedspaces.show.pattern, bedspacesController.show(), { auditEvent: 'VIEW_BEDSPACE' })

  get(paths.bookings.new.pattern, bookingsController.new(), { auditEvent: 'VIEW_BOOKING_CREATE' })
  get(paths.bookings.confirm.pattern, bookingsController.confirm(), {
    auditEvent: 'VIEW_BOOKING_CONFIRM',
  })
  get(paths.bookings.selectAssessment.pattern, bookingsController.selectAssessment(), {
    auditEvent: 'VIEW_BOOKING_SELECT_ASSESSMENT',
  })
  post(paths.bookings.create.pattern, bookingsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.new.pattern,
        auditEvent: 'CREATE_BOOKING_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_SUCCESS',
      },
    ],
  })
  get(paths.bookings.show.pattern, bookingsController.show(), { auditEvent: 'VIEW_BOOKING' })
  get(paths.bookings.history.pattern, bookingsController.history(), { auditEvent: 'VIEW_BOOKING_HISTORY' })

  get(paths.bookings.confirmations.new.pattern, confirmationsController.new(), {
    auditEvent: 'VIEW_BOOKING_CREATE_CONFIRMATION',
  })
  post(paths.bookings.confirmations.create.pattern, confirmationsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.confirmations.new.pattern,
        auditEvent: 'CREATE_BOOKING_CONFIRMATION_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_CONFIRMATION_SUCCESS',
      },
    ],
  })

  get(paths.bookings.arrivals.new.pattern, arrivalsController.new(), { auditEvent: 'VIEW_BOOKING_CREATE_ARRIVAL' })
  post(paths.bookings.arrivals.create.pattern, arrivalsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.arrivals.new.pattern,
        auditEvent: 'CREATE_BOOKING_ARRIVAL_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_ARRIVAL_SUCCESS',
      },
    ],
  })

  get(paths.bookings.departures.new.pattern, departuresController.new(), {
    auditEvent: 'VIEW_BOOKING_CREATE_DEPARTURE',
  })
  post(paths.bookings.departures.create.pattern, departuresController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.departures.new.pattern,
        auditEvent: 'CREATE_BOOKING_DEPARTURE_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_DEPARTURE_SUCCESS',
      },
    ],
  })

  get(paths.bookings.departures.edit.pattern, departuresController.edit(), {
    auditEvent: 'VIEW_BOOKING_EDIT_DEPARTURE',
  })
  put(paths.bookings.departures.update.pattern, departuresController.update(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.departures.edit.pattern,
        auditEvent: 'EDIT_BOOKING_DEPARTURE_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'EDIT_BOOKING_DEPARTURE_SUCCESS',
      },
    ],
  })

  get(paths.bookings.extensions.new.pattern, extensionsController.new(), {
    auditEvent: 'VIEW_BOOKING_CREATE_EXTENSION',
  })
  post(paths.bookings.extensions.create.pattern, extensionsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.extensions.new.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_EXTENSION_SUCCESS',
      },
    ],
  })

  get(paths.bookings.cancellations.new.pattern, cancellationsController.new(), {
    auditEvent: 'VIEW_BOOKING_CREATE_CANCELLATION',
  })
  post(paths.bookings.cancellations.create.pattern, cancellationsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.new.pattern,
        auditEvent: 'CREATE_BOOKING_CANCELLATION_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_CANCELLATION_SUCCESS',
      },
    ],
  })

  get(paths.bookings.cancellations.edit.pattern, cancellationsController.edit(), {
    auditEvent: 'VIEW_BOOKING_EDIT_CANCELLATION',
  })
  put(paths.bookings.cancellations.update.pattern, cancellationsController.update(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.cancellations.edit.pattern,
        auditEvent: 'EDIT_BOOKING_CANCELLATION_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'EDIT_BOOKING_CANCELLATION_SUCCESS',
      },
    ],
  })

  get(paths.bookings.turnarounds.new.pattern, turnaroundsController.new(), {
    auditEvent: 'VIEW_BOOKING_NEW_TURNAROUND',
  })
  post(paths.bookings.turnarounds.create.pattern, turnaroundsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.bookings.turnarounds.new.pattern,
        auditEvent: 'CREATE_BOOKING_TURNAROUND_FAILURE',
      },
      {
        path: paths.bookings.show.pattern,
        auditEvent: 'CREATE_BOOKING_TURNAROUND_SUCCESS',
      },
    ],
  })

  get(paths.reports.new.pattern, reportsController.new(), { auditEvent: 'VIEW_REPORT_CREATE' })
  post(paths.reports.create.pattern, reportsController.create(), {
    auditEvent: 'REPORT_CREATED_SUCCESS',
    auditBodyParams: ['probationRegionId'],
  })

  get(paths.lostBeds.new.pattern, lostBedsController.new(), { auditEvent: 'VIEW_LOST_BED_CREATE' })
  post(paths.lostBeds.create.pattern, lostBedsController.create(), {
    redirectAuditEventSpecs: [
      {
        path: paths.lostBeds.new.pattern,
        auditEvent: 'CREATE_LOST_BED_FAILURE',
      },
      {
        path: paths.lostBeds.show.pattern,
        auditEvent: 'CREATE_LOST_BED_SUCCESS',
      },
    ],
  })
  get(paths.lostBeds.show.pattern, lostBedsController.show(), { auditEvent: 'VIEW_LOST_BED' })
  get(paths.lostBeds.edit.pattern, lostBedsController.edit(), { auditEvent: 'VIEW_LOST_BED_EDIT' })
  put(paths.lostBeds.update.pattern, lostBedsController.update(), {
    redirectAuditEventSpecs: [
      {
        path: paths.lostBeds.edit.pattern,
        auditEvent: 'UPDATE_LOST_BED_FAILURE',
      },
      {
        path: paths.lostBeds.show.pattern,
        auditEvent: 'UPDATE_LOST_BED_SUCCESS',
      },
    ],
  })
  get(paths.lostBeds.show.pattern, lostBedsController.show(), { auditEvent: 'VIEW_LOST_BED' })
  get(paths.lostBeds.cancellations.new.pattern, lostBedsController.newCancellation(), {
    auditEvent: 'VIEW_LOST_BED_CANCEL',
  })
  post(paths.lostBeds.cancellations.create.pattern, lostBedsController.createCancellation(), {
    redirectAuditEventSpecs: [
      {
        path: paths.lostBeds.cancellations.new.pattern,
        auditEvent: 'CANCEL_LOST_BED_FAILURE',
      },
      {
        path: paths.lostBeds.show.pattern,
        auditEvent: 'CANCEL_LOST_BED_SUCCESS',
      },
    ],
  })

  get(paths.bookings.search.provisional.index.pattern, bookingSearchController.index('provisional'), {
    auditEvent: 'VIEW_SEARCH_PROVISIONAL_BOOKINGS',
  })
  get(paths.bookings.search.active.index.pattern, bookingSearchController.index('arrived'), {
    auditEvent: 'VIEW_SEARCH_ACTIVE_BOOKINGS',
  })
  get(paths.bookings.search.departed.index.pattern, bookingSearchController.index('departed'), {
    auditEvent: 'VIEW_SEARCH_DEPARTED_BOOKINGS',
  })
  get(paths.bookings.search.confirmed.index.pattern, bookingSearchController.index('confirmed'), {
    auditEvent: 'VIEW_SEARCH_CONFIRMED_BOOKINGS',
  })

  get(paths.bedspaces.search.pattern, bedspaceSearchController.index(), { auditEvent: 'VIEW_SEARCH_BEDSPACES' })

  get(paths.assessments.index.pattern, assessmentsController.index(), { auditEvent: 'VIEW_ASSESSMENTS_LIST' })
  get(paths.assessments.archive.pattern, assessmentsController.archive(), {
    auditEvent: 'VIEW_ARCHIVE_ASSESSMENTS_LIST',
  })
  get(paths.assessments.full.pattern, assessmentsController.full(), {
    auditEvent: 'VIEW_FULL_ASSESSMENT',
  })
  get(paths.assessments.summary.pattern, assessmentsController.summary(), {
    auditEvent: 'VIEW_ASSESSMENT_SUMMARY',
  })
  get(paths.assessments.confirm.pattern, assessmentsController.confirm(), {
    auditEvent: 'VIEW_ASSESSMENT_STATUS_CHANGE_CONFIRM',
  })

  put(paths.assessments.update.pattern, assessmentsController.update(), {
    auditEvent: 'UPDATE_ASSESSMENT',
    redirectAuditEventSpecs: [
      {
        path: paths.assessments.full.pattern,
        auditEvent: 'UPDATE_ASSESSMENT_SUCCESS',
      },
    ],
  })

  post(paths.assessments.notes.create.pattern, assessmentsController.createNote(), {
    redirectAuditEventSpecs: [
      {
        path: `${paths.assessments.summary.pattern}\\?success=false`,
        auditEvent: 'CREATE_ASSESSMENT_NOTE_FAILURE',
      },
      {
        path: `${paths.assessments.summary.pattern}\\?success=true`,
        auditEvent: 'CREATE_ASSESSMENT_NOTE_SUCCESS',
      },
    ],
  })

  return router
}
