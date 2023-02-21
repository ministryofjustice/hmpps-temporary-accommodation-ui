/* istanbul ignore file */

import type { Router } from 'express'

import type { Controllers } from '../../controllers'
import paths from '../../paths/temporary-accommodation/manage'
import { Services } from '../../services'

import actions from '../utils'

export default function routes(controllers: Controllers, services: Services, router: Router): Router {
  const { get, post, put } = actions(router, services.auditService)

  const {
    premisesController,
    bedspacesController,
    bookingsController,
    confirmationsController,
    arrivalsController,
    departuresController,
    extensionsController,
    cancellationsController,
    bookingReportsController,
  } = controllers.temporaryAccommodation

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
  post(paths.bookings.confirm.pattern, bookingsController.confirm(), {
    auditEvent: 'VIEW_BOOKING_CONFIRM',
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

  get(paths.reports.bookings.new.pattern, bookingReportsController.new(), { auditEvent: 'VIEW_REPORT_CREATE' })
  post(paths.reports.bookings.create.pattern, bookingReportsController.create(), {
    auditEvent: 'REPORT_CREATED_SUCCESS',
    auditBodyParams: ['probationRegionId'],
  })

  return router
}
