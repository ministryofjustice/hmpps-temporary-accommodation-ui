import { Page, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { unzipSync, strFromU8 } from 'fflate'
import { ProbationRegion } from '@temporary-accommodation-ui/e2e'
import { visitDashboard } from './signIn'
import { ReportsPage } from '../pages/reports/reportsPage'

const reportTypeMetaData = {
  book: {
    columnNames: [
      'bookingId',
      'referralId',
      'referralDate',
      'personName',
      'pncNumber',
      'gender',
      'ethnicity',
      'dateOfBirth',
      'riskOfSeriousHarm',
      'registeredSexOffender',
      'historyOfSexualOffence',
      'concerningSexualBehaviour',
      'needForAccessibleProperty',
      'historyOfArsonOffence',
      'concerningArsonBehaviour',
      'dutyToReferMade',
      'dateDutyToReferMade',
      'dutyToReferLocalAuthorityAreaName',
      'isReferralEligibleForCas3',
      'referralEligibilityReason',
      'probationRegion',
      'pdu',
      'localAuthority',
      'town',
      'postCode',
      'crn',
      'offerAccepted',
      'isCancelled',
      'cancellationReason',
      'startDate',
      'endDate',
      'actualEndDate',
      'currentNightsStayed',
      'actualNightsStayed',
      'accommodationOutcome',
    ],
    callToAction: 'Download booking data',
  },
  bedSpace: {
    columnNames: [
      'probationRegion',
      'pdu',
      'localAuthority',
      'propertyRef',
      'addressLine1',
      'town',
      'postCode',
      'bedspaceRef',
      'crn',
      'type',
      'startDate',
      'endDate',
      'durationOfBookingDays',
      'bookingStatus',
      'voidCategory',
      'voidNotes',
      'uniquePropertyRef',
      'uniqueBedspaceRef',
    ],
    callToAction: 'Download bedspace usage',
  },
  futureBookings: {
    columnNames: [
      'bookingId',
      'referralId',
      'referralDate',
      'personName',
      'gender',
      'ethnicity',
      'dateOfBirth',
      'riskOfSeriousHarm',
      'registeredSexOffender',
      'historyOfSexualOffence',
      'concerningSexualBehaviour',
      'dutyToReferMade',
      'dateDutyToReferMade',
      'dutyToReferLocalAuthorityAreaName',
      'probationRegion',
      'pdu',
      'localAuthority',
      'addressLine1',
      'postCode',
      'crn',
      'sourceOfReferral',
      'prisonAtReferral',
      'startDate',
      'accommodationRequiredDate',
      'updatedAccommodationRequiredDate',
      'bookingStatus',
    ],
    callToAction: 'Download future bookings report',
  },
  occupancy: {
    columnNames: [
      'probationRegion',
      'pdu',
      'localAuthority',
      'propertyRef',
      'addressLine1',
      'town',
      'postCode',
      'bedspaceRef',
      'bookedDaysActiveAndClosed',
      'confirmedDays',
      'provisionalDays',
      'scheduledTurnaroundDays',
      'effectiveTurnaroundDays',
      'voidDays',
      'totalBookedDays',
      'bedspaceStartDate',
      'bedspaceEndDate',
      'bedspaceOnlineDays',
      'occupancyRate',
      'uniquePropertyRef',
      'uniqueBedspaceRef',
    ],
    callToAction: 'Download occupancy report',
  },
  referrals: {
    columnNames: [
      'referralId',
      'referralDate',
      'personName',
      'pncNumber',
      'crn',
      'sex',
      'genderIdentity',
      'ethnicity',
      'dateOfBirth',
      'registeredSexOffender',
      'historyOfSexualOffence',
      'concerningSexualBehaviour',
      'needForAccessibleProperty',
      'riskOfSeriousHarm',
      'historyOfArsonOffence',
      'concerningArsonBehaviour',
      'dutyToReferMade',
      'dateDutyToReferMade',
      'dutyToReferLocalAuthorityAreaName',
      'dutyToReferOutcome',
      'town',
      'postCode',
      'probationRegion',
      'pdu',
      'referralSubmittedDate',
      'referralRejected',
      'rejectionReason',
      'rejectionReasonExplained',
      'rejectionDate',
      'sourceOfReferral',
      'prisonReleaseType',
      'prisonAtReferral',
      'releaseDate',
      'updatedReleaseDate',
      'accommodationRequiredDate',
      'updatedAccommodationRequiredFromDate',
      'bookingOffered',
    ],
    callToAction: 'Download referrals report',
  },
  bookingGap: {
    columnNames: ['probationRegion', 'pduName', 'premisesName', 'bedName', 'gap', 'gapDays'],
    callToAction: 'Download gap report',
  },
}

type ReportType = keyof typeof reportTypeMetaData

export const visitReportsPageAndDownloadReport = async (
  page: Page,
  reportType: ReportType,
  probationRegion: ProbationRegion,
) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickDownloadDataLink()

  const reportPage = await ReportsPage.initialize(page)
  await reportPage.enterFormDetails(probationRegion)

  const path = await downloadReport(reportType, page)
  confirmColumnNames(reportType, path)
}

const downloadReport = async (reportType: ReportType, page: Page) => {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: reportTypeMetaData[reportType].callToAction }).click()
  const download = await downloadPromise
  return download.path()
}

const confirmColumnNames = (reportType: ReportType, path: string) => {
  const files = unzipSync(new Uint8Array(readFileSync(path)))
  const xml = Object.entries(files)
    .filter(([name]) => name.startsWith('xl/'))
    .map(([, data]) => strFromU8(data))
    .join('')

  reportTypeMetaData[reportType].columnNames.forEach(columnName => {
    expect(xml.includes(columnName)).toBe(true)
  })
}
