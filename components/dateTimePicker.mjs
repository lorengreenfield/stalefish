import datePicker from './datePicker.mjs'
import timePicker from './timePicker.mjs'

// Delegator component for backward compatibility.
// New usage is to import and use datePicker or timePicker directly.
export default function dateTimePicker (props = {}) {
  const { timeOnly, dateTime } = props
  if (timeOnly) {
    // Inline controls, no popup
    return timePicker({ ...props })
  }
  if (dateTime) {
    if (typeof console !== 'undefined' && console && console.warn) {
      console.warn('stalefish/dateTimePicker: combined dateTime mode is deprecated. Use separate datePicker and timePicker fields.')
    }
    // Fall back to showing just the date portion to avoid breaking UIs.
    return datePicker({ ...props })
  }
  // Default: date-only picker with popup
  return datePicker({ ...props })
}
