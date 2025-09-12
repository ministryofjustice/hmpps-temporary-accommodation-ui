import { Page, expect } from '@playwright/test'
import { Bedspace, Property } from '@temporary-accommodation-ui/e2e'
import { DateFormats } from 'server/utils/dateUtils'
import { ListPropertiesPage } from '../../pages/manage/v2/listPropertiesPage'
import { AddPropertyPage } from '../../pages/manage/v2/addPropertyPage'
import { ViewPropertyPage } from '../../pages/manage/v2/viewPropertyPage'
import { EditPropertyPage } from '../../pages/manage/v2/editPropertyPage'
import { ViewBedspacePage } from '../../pages/manage/v2/viewBedspacePage'
import { AddBedspacePage } from '../../pages/manage/v2/addBedspacePage'
import { ViewBedspacesPage } from '../../pages/manage/v2/viewBedspacesPage'
import { EditBedspacePage } from '../../pages/manage/v2/editBedspacePage'
import { ArchivePropertyPage } from '../../pages/manage/v2/archivePropertyPage'
import { UnarchivePropertyPage } from '../../pages/manage/v2/unarchivePropertyPage'
import { CancelArchivePropertyPage } from '../../pages/manage/v2/cancelArchivePropertyPage'
import { ArchiveBedspacePage } from '../../pages/manage/v2/archiveBedspacePage'
import { UnarchiveBedspacePage } from '../../pages/manage/v2/unarchiveBedspacePage'
import { CancelArchiveBedspacePage } from '../../pages/manage/v2/cancelArchiveBedspacePage'

export const visitListPropertiesPage = async (page: Page) => {
  // TODO: navigate to the list properties page from the dashboard once the v2 pages are live in prod
  await ListPropertiesPage.goto(page)
}

export const createProperty = async (page: Page, property: Property) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.clickAddPropertyButton()

  const addPropertyPage = await AddPropertyPage.initialise(page)
  await addPropertyPage.enterFormDetails(property)
  await addPropertyPage.clickSubmit()

  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showPropertyPage.isBannerMessageDisplayed('Property added')
  expect(isBannerMessageDisplayed).toBe(true)
}

export const searchForProperty = async (page: Page, address: string) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.searchForOnlineProperty(address)
  await listPropertiesPage.checkAllEntriesMatchAddress(address)
}

export const navigateToProperty = async (page: Page, property: Property) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.clickManageLink(property)
  await showProperty(page, property)
}

export const showProperty = async (page: Page, property: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.shouldShowPropertyDetails(property)
}

export const editProperty = async (page: Page, property: Property, updatedProperty: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickEditButton()

  const editPropertyPage = await EditPropertyPage.initialise(page)
  await editPropertyPage.shouldShowPropertyDetails(property)
  await editPropertyPage.clearFormDetails()
  await editPropertyPage.enterFormDetails(updatedProperty)
  await editPropertyPage.clickSubmit()

  const updatedShortAddress = `${updatedProperty.addressLine1}, ${updatedProperty.postcode}`
  const showUpdatedPropertyPage = await ViewPropertyPage.initialise(page, updatedShortAddress)
  const isBannerMessageDisplayed = await showUpdatedPropertyPage.isBannerMessageDisplayed('Property edited')
  expect(isBannerMessageDisplayed).toBe(true)
  await showUpdatedPropertyPage.shouldShowPropertyDetails(updatedProperty)
}

export const archiveProperty = async (page: Page, property: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickArchiveButton()

  const archivePropertyPage = await ArchivePropertyPage.initialise(page, property.addressLine1)
  const archiveDate = await archivePropertyPage.archiveToday()

  const showArchivedPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showArchivedPropertyPage.isBannerMessageDisplayed(
    'Property and bedspaces archived',
  )
  expect(isBannerMessageDisplayed).toBe(true)
  await showArchivedPropertyPage.shouldShowPropertyStatus('Archived')
  await showArchivedPropertyPage.shouldShowArchiveDates(archiveDate)
}

export const scheduleArchiveProperty = async (page: Page, property: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickArchiveButton()

  const archivePropertyPage = await ArchivePropertyPage.initialise(page, property.addressLine1)
  await archivePropertyPage.scheduleFutureArchive()

  const showUpdatedPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showUpdatedPropertyPage.isBannerMessageDisplayed(
    'Property and bedspaces updated',
  )
  expect(isBannerMessageDisplayed).toBe(true)
  await showUpdatedPropertyPage.shouldShowPropertyStatus('Online')
}

export const unarchiveProperty = async (page: Page, property: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickUnarchiveButton()

  const unarchivePropertyPage = await UnarchivePropertyPage.initialise(page, property.addressLine1)
  const unarchiveDate = await unarchivePropertyPage.unarchiveToday()

  const showUnarchivedPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showUnarchivedPropertyPage.isBannerMessageDisplayed(
    'Property and bedspaces online',
  )
  expect(isBannerMessageDisplayed).toBe(true)
  await showUnarchivedPropertyPage.shouldShowPropertyStatus('Online')
  await showUnarchivedPropertyPage.shouldShowOnlineDates(unarchiveDate)
}

export const cancelScheduledArchiveProperty = async (page: Page, property: Property) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickCancelScheduledArchiveButton()

  const cancelArchivePropertyPage = await CancelArchivePropertyPage.initialise(page, property.addressLine1)
  await cancelArchivePropertyPage.confirmCancelArchive()

  const showUpdatedPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showUpdatedPropertyPage.isBannerMessageDisplayed('Scheduled archive cancelled')
  expect(isBannerMessageDisplayed).toBe(true)
}

export const createBedspace = async (page: Page, property: Property, bedspace: Bedspace) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickAddABedspace()

  const addBedspacePage = await AddBedspacePage.initialise(page)
  await addBedspacePage.enterFormDetails(bedspace)
  await addBedspacePage.clickSubmit()

  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  const isBannerMessageDisplayed = await showBedspacePage.isBannerMessageDisplayed('Bedspace added')
  expect(isBannerMessageDisplayed).toBe(true)
  await showBedspacePage.shouldShowPropertySummary(property)
  await showBedspacePage.shouldShowBedspaceDetails(bedspace)
}

export const navigateToPropertyFromBedspace = async (page: Page, property: Property, bedspace: Bedspace) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.clickBackToProperty(shortAddress)
}

export const navigateToBedspace = async (page: Page, property: Property, bedspace: Bedspace) => {
  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.clickBedspacesOverview()

  const showBedspacesPage = await ViewBedspacesPage.initialise(page, shortAddress)
  await showBedspacesPage.shouldShowBedspace(bedspace)
  await showBedspacesPage.clickManageBedspaceLink(bedspace)
}

export const showBedspace = async (page: Page, property: Property, bedspace: Bedspace) => {
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.shouldShowPropertySummary(property)
  await showBedspacePage.shouldShowBedspaceDetails(bedspace)
}

export const editBedspace = async (page: Page, property: Property, bedspace: Bedspace, updatedBedspace: Bedspace) => {
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.shouldShowPropertySummary(property)
  await showBedspacePage.shouldShowBedspaceDetails(bedspace)
  await showBedspacePage.clickEditButton()

  const editBedspacePage = await EditBedspacePage.initialise(page)
  await editBedspacePage.shouldShowPropertySummary(property)
  await editBedspacePage.shouldShowBedspaceDetails(bedspace)
  await editBedspacePage.clearFormDetails()
  await editBedspacePage.enterFormDetails(updatedBedspace)
  await editBedspacePage.clickSubmit()

  const showUpdatedBedspacePage = await ViewBedspacePage.initialise(page, updatedBedspace.reference)
  const isBannerMessageDisplayed = await showUpdatedBedspacePage.isBannerMessageDisplayed('Bedspace edited')
  expect(isBannerMessageDisplayed).toBe(true)
  await showBedspacePage.shouldShowPropertySummary(property)
  await showBedspacePage.shouldShowBedspaceDetails(updatedBedspace)
}

export const archiveBedspace = async (page: Page, bedspace: Bedspace, options: { date?: Date } = {}) => {
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.clickArchiveButton()

  const archiveBedspacePage = await ArchiveBedspacePage.initialise(page, bedspace.reference)
  if (options.date) {
    await archiveBedspacePage.archiveAnotherDate(options.date)
  } else {
    await archiveBedspacePage.archiveToday()
  }

  const showArchivedBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  if (options.date) {
    const isArchivedBedspaceAndPropertyMessageDisplayed = await showArchivedBedspacePage.isBannerMessageDisplayed(
      'Bedspace and property updated',
    )
    expect(isArchivedBedspaceAndPropertyMessageDisplayed).toBe(true)
    await showArchivedBedspacePage.shouldShowBedspaceStatus('Online')
  } else {
    const isArchiveBedspaceOnlyMessageDisplayed =
      await showArchivedBedspacePage.isBannerMessageDisplayed('Bedspace archived')
    const isArchivedBedspaceAndPropertyMessageDisplayed = await showArchivedBedspacePage.isBannerMessageDisplayed(
      'Bedspace and property archived',
    )
    expect(isArchiveBedspaceOnlyMessageDisplayed || isArchivedBedspaceAndPropertyMessageDisplayed).toBe(true)
    await showArchivedBedspacePage.shouldShowBedspaceStatus('Archived')
  }
}

export const unarchiveBedspace = async (page: Page, property: Property, bedspace: Bedspace) => {
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.clickUnarchiveButton()
  const unarchiveBedspacePage = await UnarchiveBedspacePage.initialise(page, bedspace.reference)
  await unarchiveBedspacePage.unarchiveToday()
  const showUnarchivedBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  const isArchiveBedspaceOnlyMessageDisplayed =
    await showUnarchivedBedspacePage.isBannerMessageDisplayed('Bedspace online')
  const isArchivedBedspaceAndPropertyMessageDisplayed =
    await showUnarchivedBedspacePage.isBannerMessageDisplayed('Bedspace and property online')
  expect(isArchiveBedspaceOnlyMessageDisplayed || isArchivedBedspaceAndPropertyMessageDisplayed).toBe(true)
  await showUnarchivedBedspacePage.shouldShowBedspaceStatus('Online')
}

export const cancelArchiveBedspace = async (page: Page, bedspace: Bedspace, options: { date: Date }) => {
  const showBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  await showBedspacePage.clickCancelArchiveButton()
  const cancelArchiveBedspacePage = await CancelArchiveBedspacePage.initialise(
    page,
    DateFormats.isoDateToUIDate(options.date.toString()),
  )
  await cancelArchiveBedspacePage.clickYes()
  const showCancelledArchiveBedspacePage = await ViewBedspacePage.initialise(page, bedspace.reference)
  const isBannerMessageDisplayed = await showCancelledArchiveBedspacePage.isBannerMessageDisplayed(
    'Bedspace and property archive cancelled',
  )
  expect(isBannerMessageDisplayed).toBe(true)
  await showCancelledArchiveBedspacePage.shouldShowBedspaceStatus('Online')
}
