const removeElementsSelector = '.govuk-error-summary, .govuk-error-message'
const removeClasses = ['.govuk-form-group--error', '.govuk-select--error']

document
  .querySelectorAll('form[data-reset-errors-on-submit="true"]')
  .forEach(e => e.addEventListener('submit', resetErrors))

function resetErrors() {
  document.querySelectorAll(removeElementsSelector).forEach(e => e.remove())
  removeClasses.forEach(className => {
    document.querySelectorAll(className).forEach(e => e.classList.remove(className.slice(1)))
  })
}
