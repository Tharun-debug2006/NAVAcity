/**
 * The one number-formatting helper of the application.
 *
 * NavaCity uses a neutral English locale so fictional passenger figures stay
 * readable and do not imply a real-world city or audience. Every screen
 * imports this file - there is no second implementation.
 */

const NUMBER_FORMAT = new Intl.NumberFormat('en-US')

/** Format a number with standard grouping (2,408 / 64,866,540). */
export function formatNumber(value, options = {}) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '0'
  return NUMBER_FORMAT.format(Math.round(numeric))
}

/** Format a number with a fixed number of decimals and standard grouping. */
export function formatDecimal(value, decimals = 1) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return (0).toFixed(decimals)
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format a percentage with a fixed number of decimals. */
export function formatPercent(value, decimals = 1) {
  return `${formatDecimal(value, decimals)} %`
}

/** Format an hour of the day as "08:00". */
export function formatHour(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

/** Format a number of minutes as "5.7 min". */
export function formatMinutes(value, decimals = 1) {
  return `${formatDecimal(value, decimals)} min`
}

export default formatNumber
