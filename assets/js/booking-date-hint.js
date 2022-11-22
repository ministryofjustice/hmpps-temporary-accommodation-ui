
  const daysToAdd = 84

  const startDayInput = document.getElementById('arrivalDate-day')
  const startMonthInput = document.getElementById('arrivalDate-month')
  const startYearInput = document.getElementById('arrivalDate-year')

  const hintContainer = document.getElementById('departureDate-hint')

  const updateEndDate = () => {
    hintContainer.innerText = ''

    const startDay = Number.parseInt(startDayInput.value, 10)
    const startMonth = Number.parseInt(startMonthInput.value, 10)
    const startYear = Number.parseInt(startYearInput.value, 10)

    if (isNaN(startDay) || isNaN(startMonth) || isNaN(startYear)) {
      return
    }

    const startDate = new Date(startYear, startMonth - 1, startDay)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + daysToAdd)

    const endDay = endDate.getDate()
    const endMonth = endDate.getMonth() + 1
    const endYear = endDate.getFullYear()

    if (isNaN(endDay) || isNaN(endMonth) || isNaN(endYear)) {
      return
    }

    hintContainer.innerText = `The end date for a booking of 84 days is ${endDay}/${endMonth}/${endYear}`
  }

  startDayInput.addEventListener('input', updateEndDate)
  startMonthInput.addEventListener('input', updateEndDate)
  startYearInput.addEventListener('input', updateEndDate)

  updateEndDate()
