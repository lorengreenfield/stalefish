import { html, css, formField, fieldIsTouched, rerender } from 'halfcab'
import calendarIcon from './icons/calendarIcon.mjs'
import solidDown from './icons/solidDown.mjs'

// Styles aligned with timePicker and prior design tweaks
const styles = css`
  .textfield {
    padding: 10px;
    border: solid 5px #c9c9c9;
    transition: border 0.3s;
    outline: none;
    width: 100%;
    font-size: 18px;
    border-radius: 0;
    box-shadow: none !important;
    font-weight: normal;
    box-sizing: border-box;
    font-family: inherit;
    line-height: 1.4em;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    z-index: 20;
    position: relative;
    height: 55px;
    background-color: #FFF;
    color: #999;
  }

  .noType {
    caret-color: transparent;
    user-select: none;
  }

  .textfield::placeholder { color: #999; }

  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
    user-select: none;
    position: absolute;
    top: -55px;
    z-index: 10;
  }

  .icon {
    position: absolute;
    right: 12px;
    top: 17px;
    width: 20px;
    height: 20px;
    opacity: 0.8;
    z-index: 25;
    pointer-events: none;
  }

  .withRightIcon { padding-right: 44px; }

  .clear {
    cursor: pointer;
    position: absolute;
    color: #AAA;
    font-size: 0.8em;
    line-height: 0.9em;
    font-weight: normal;
    box-sizing: border-box;
    right: 42px; /* 10px gap from calendar icon at right:12px, width 20px */
    background-color: #EEE;
    padding: 5px 10px;
    z-index: 30;
    border-radius: 3px;
    top: 17px;
  }

  .popup { position: absolute; z-index: 9999; top: 55px; left: 0; background: #fff; border: 1px solid #c9c9c9; box-shadow: 0 2px 10px rgba(0,0,0,.15); padding: 4px; color: #999; }
  .calHeader { display: flex; align-items: center; justify-content: space-between; padding: 4px 6px; }
  .navBtn { background: transparent; border: none; cursor: pointer; padding: 4px; color: #ccc; }
  .navBtn:focus { outline: none; }
  .navBtn:focus-visible { outline: 2px solid #c9c9c9; outline-offset: 2px; }
  .monthLabel { position: relative; top: -2px; font-weight: 500; }
  .arrowIcon { display: inline-block; width: 13px; height: 13px; color: #c9c9c9; line-height: 0; }
  .arrowIcon > svg { display: block; width: 13px; height: 13px; }
  .weekHead { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; padding: 2px 6px; font-size: 12px; opacity: 0.8; }
  .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; padding: 0 6px 6px; }
`

// Internal symbols for per-holdingPen state
const STATE_SYMBOL = Symbol.for('stalefish.date.state')
const ID_MAP_SYMBOL = Symbol.for('stalefish.date.idMap')

function pad2 (n) { return (n < 10 ? '0' : '') + n }

function parseYMD (str) {
  if (!str || typeof str !== 'string') return null
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(str)
  if (!m) return null
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) - 1
  const d = parseInt(m[3], 10)
  const dt = new Date(y, mo, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null
  return dt
}

function toYMD (date) {
  if (!(date instanceof Date)) return ''
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

// Lightweight moment-style formatter for display only
// Supported tokens: YYYY, YY, MMMM, MMM, MM, M, DD, D
// This avoids adding a dependency while covering common needs
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate (date, fmt = 'YYYY-MM-DD') {
  if (!(date instanceof Date)) return ''
  const Y = date.getFullYear()
  const M = date.getMonth() + 1
  const D = date.getDate()
  // Build a token map and replace via a single regex pass to prevent
  // cascading replacements (e.g., replacing D inside Dec from MMM).
  const tokenMap = {
    YYYY: String(Y),
    YY: String(Y).slice(-2),
    MMMM: MONTH_NAMES_FULL[M - 1],
    MMM: MONTH_NAMES_SHORT[M - 1],
    MM: pad2(M),
    M: String(M),
    DD: pad2(D),
    D: String(D)
  }
  // Longest tokens first in alternation to ensure correct matching
  const re = /(YYYY|MMMM|MMM|YY|MM|M|DD|D)/g
  return fmt.replace(re, (match) => tokenMap[match] ?? match)
}

function ensureState (holdingPen, property) {
  if (!holdingPen) return {}
  if (!holdingPen[STATE_SYMBOL]) {
    Object.defineProperty(holdingPen, STATE_SYMBOL, { value: {}, enumerable: false })
  }
  const map = holdingPen[STATE_SYMBOL]
  if (!map[property]) {
    map[property] = { open: false, viewMonth: null, viewYear: null, tmpDate: null }
  }
  return map[property]
}

function ensureId (holdingPen, property, uniqueKey) {
  if (!holdingPen) return `sf-date-${property || Math.random().toString(36).slice(2)}`
  if (!holdingPen[ID_MAP_SYMBOL]) {
    Object.defineProperty(holdingPen, ID_MAP_SYMBOL, { value: {}, enumerable: false })
  }
  const map = holdingPen[ID_MAP_SYMBOL]
  if (!map[property]) {
    map[property] = `sf-date-${property}-${Math.random().toString(36).slice(2)}`
  }
  return `sf-date-${uniqueKey || map[property]}`
}

function commitValue ({ holdingPen, property, onchange, valueStr }) {
  const fauxE = { currentTarget: { validity: { valid: true }, value: valueStr } }
  formField(holdingPen, property)(fauxE)
  onchange && onchange(fauxE)
}

function getMonthMatrix (year, month) {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0-6 Sun-Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const cells = []
  // Fill leading blanks from previous month
  for (let i = 0; i < startDay; i++) {
    cells.push({ d: prevMonthDays - startDay + 1 + i, other: true })
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) cells.push({ d, other: false })
  // Trailing blanks to fill 6 rows of 7 or to end of grid
  while (cells.length % 7 !== 0) cells.push({ d: cells.length, other: true })
  return cells
}

function buildCalendarUI ({ state, today, onPickDay, onPrevMonth, onNextMonth }) {
  const y = state.viewYear
  const m = state.viewMonth
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const weekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells = getMonthMatrix(y, m)
  const sel = state.tmpDate
  const isToday = (d) => today.getFullYear() === y && today.getMonth() === m && today.getDate() === d
  const isSelected = (d) => sel && sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d

  return html`
    <div class="${styles.calHeader}">
      <button type="button" class="${styles.navBtn}" onclick=${onPrevMonth} aria-label="Previous month">
        <span class="${styles.arrowIcon}" style="transform: rotate(90deg);">${solidDown({ colour: '#ccc' })}</span>
      </button>
      <div class="${styles.monthLabel}">${monthNames[m]} ${y}</div>
      <button type="button" class="${styles.navBtn}" onclick=${onNextMonth} aria-label="Next month">
        <span class="${styles.arrowIcon}" style="transform: rotate(270deg);">${solidDown({ colour: '#ccc' })}</span>
      </button>
    </div>
    <div class="${styles.weekHead}">${weekNames.map(w => html`<div style="text-align:center;">${w}</div>`)}</div>
    <div class="${styles.grid}">
      ${cells.map((c, idx) => {
        if (c.other) return html`<div></div>`
        const d = c.d
        const selStyle = isSelected(d) ? 'background:#48aaf3; color:#fff;' : 'color:#999;'
        const bgStyle = isSelected(d) ? '' : 'background:#fff;'
        const todayStyle = isToday(d) ? 'box-shadow: inset 0 0 0 2px #c9c9c9;' : ''
        return html`<button type="button" style="padding:6px; ${selStyle} ${bgStyle} ${todayStyle} border:1px solid #c9c9c9; cursor:pointer;" onclick=${() => onPickDay(d)}>${d}</button>`
      })}
    </div>
  `
}

export default function datePicker ({
  wrapperStyle = null,
  holdingPen,
  label,
  placeholder,
  property,
  required,
  pattern,
  disabled,
  disableClear = false,
  onchange,
  oninput,
  format = 'YYYY-MM-DD',
  uniqueKey
} = {}) {
  const wrapperId = ensureId(holdingPen, property, uniqueKey)
  const state = ensureState(holdingPen, property)

  const currentStr = holdingPen && property ? holdingPen[property] : ''
  const now = new Date()
  if (state.viewMonth === null || state.viewYear === null) {
    const baseDate = parseYMD(currentStr) || now
    state.viewMonth = baseDate.getMonth()
    state.viewYear = baseDate.getFullYear()
  }
  if (!state.tmpDate) {
    state.tmpDate = parseYMD(currentStr) || new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }

  const commit = () => {
    const valueStr = state.tmpDate ? toYMD(state.tmpDate) : ''
    commitValue({ holdingPen, property, onchange, valueStr })
    state.open = false
    rerender()
  }

  const clearValue = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault() }
    commitValue({ holdingPen, property, onchange, valueStr: '' })
    state.open = false
    rerender()
    return false
  }

  // No typing allowed for date input; interaction is via popup only

  const open = (e) => {
    if (disabled) return
    e && e.stopPropagation()
    // Make opening idempotent to avoid double-toggle on focus+click
    if (state.open) return
    state.open = true
    rerender()
    if (typeof window !== 'undefined' && state.open) {
      const closeOnOutside = (ev) => {
        const wrapperEl = document.getElementById(wrapperId)
        if (!wrapperEl) return
        if (!wrapperEl.contains(ev.target)) {
          state.open = false
          rerender()
          document.removeEventListener('mousedown', closeOnOutside, true)
        }
      }
      setTimeout(() => document.addEventListener('mousedown', closeOnOutside, true), 0)
    }
  }

  const popup = state.open
    ? html`<div class="${styles.popup}" role="dialog" aria-modal="false">
        ${buildCalendarUI({
          state,
          today: new Date(),
          onPickDay: (d) => { state.tmpDate = new Date(state.viewYear, state.viewMonth, d); commit() },
          onPrevMonth: () => { if (state.viewMonth === 0) { state.viewMonth = 11; state.viewYear -= 1 } else { state.viewMonth -= 1 }; rerender() },
          onNextMonth: () => { if (state.viewMonth === 11) { state.viewMonth = 0; state.viewYear += 1 } else { state.viewMonth += 1 }; rerender() }
        })}
      </div>`
    : ''

  const displayValue = (() => {
    const d = parseYMD(currentStr)
    if (!d) return ''
    return formatDate(d, format || 'YYYY-MM-DD')
  })()

  return html`
    <div id="${wrapperId}" class="${wrapperStyle}" style="min-height: 55px; display: inline-block; width: calc(100% - 10px); margin: 40px 5px 5px 5px;">
      <div style="display: inline-block; width: 100%; text-align: left; position: relative; padding: 0;" onclick=${e => e.stopPropagation()}>
        ${label ? html`<span class="${styles.label}" style="opacity: ${(holdingPen && (holdingPen[property] === 0 || holdingPen[property])) ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); position: absolute; top: -36px;">${label}${required ? ' *' : ''}</span>` : ''}
        ${!disableClear ? html`<div data-clear class="${styles.clear}" onclick=${clearValue}>clear</div>` : ''}
        <div class="${styles.icon}">${calendarIcon({ colour: '#ccc', width: 20, height: 20 })}</div>
        <input data-gramm="false" ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : 'cursor: pointer;'}" class="${styles.textfield} ${styles.noType} ${styles.withRightIcon} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" ${required ? { required: 'required' } : ''}
          onclick=${open}
          onfocus=${open}
          readonly
          placeholder="${(placeholder || 'Date') + (required ? ' *' : '')}"
          type="text" ${pattern ? { pattern } : ''}
          .value=${displayValue} data-input />
        ${popup}
      </div>
    </div>
  `
}
