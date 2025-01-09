const $datepickers = document.querySelectorAll('[data-module="moj-date-picker"]')
MOJFrontend.nodeListForEach($datepickers, function ($datepicker) {
  new MOJFrontend.DatePicker($datepicker, {}).init();
})

const $buttonmenu = document.querySelectorAll('[data-module="moj-button-menu"]');
MOJFrontend.nodeListForEach($buttonmenu, function ($buttonmenu) {
  new MOJFrontend.ButtonMenu($buttonmenu, {}).init();
})

const $sortableTables = document.querySelectorAll('[data-module="moj-sortable-table"]');
MOJFrontend.nodeListForEach($sortableTables, function ($table) {
  new MOJFrontend.SortableTable({
    table: $table
  })
})
