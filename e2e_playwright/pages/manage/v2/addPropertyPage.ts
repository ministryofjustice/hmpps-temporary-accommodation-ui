import { Page, expect } from '@playwright/test'
import { EditablePropertyPage } from './editablePropertyPage'

export class AddPropertyPage extends EditablePropertyPage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Add a property')
    return new AddPropertyPage(page)
  }
}
