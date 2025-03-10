import { Page, expect } from '@playwright/test'
import Excel, { CellValue } from 'exceljs'
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
  await confirmColumnNames(reportType, path)
}

const downloadReport = async (reportType: ReportType, page: Page) => {
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: reportTypeMetaData[reportType].callToAction }).click()
  const download = await downloadPromise
  return download.path()
}

const confirmColumnNames = async (reportType: ReportType, path: string) => {
  const workbook = new Excel.Workbook()

  await workbook.xlsx.readFile(path).then(() => {
    const sh = workbook.getWorksheet('Sheet0')

    const headerCells: CellValue[] = []
    sh.getRow(1).eachCell(cell => headerCells.push(cell.value))

    reportTypeMetaData[reportType].columnNames.forEach(columnName => {
      expect(headerCells.includes(columnName)).toBe(true)
    })
  })
}
