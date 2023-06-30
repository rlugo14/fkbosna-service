const getMonthLimits = (month: number, year: number) => ({
  firstDay: new Date(year, month, 1),
  lastDay: new Date(year, month + 1, 0, 23, 59, 59),
});

export default getMonthLimits;
