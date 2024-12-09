const $datepickers = document.querySelectorAll('[data-module="moj-date-picker"]')
MOJFrontend.nodeListForEach($datepickers, function ($datepicker) {
  new MOJFrontend.DatePicker($datepicker, {}).init();
})
