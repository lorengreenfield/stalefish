import { html, css, formField, fieldIsTouched, rerender } from 'halfcab'
import timeIcon from './icons/timeIcon.mjs'
import solidDown from './icons/solidDown.mjs'

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

    /* Placeholder text color */
    .textfield::placeholder {
        color: #999;
    }

    .label {
        transition: opacity 0.75s;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        user-select: none;
        position: absolute;
        top: -55px;
        z-index: 10;
    }

    .controls {
        position: absolute;
        right: 100px; /* move 20px closer to the clear button */
        top: 50%; /* precisely center the stacked arrows vertically */
        transform: translateY(-50%);
        display: flex;
        flex-direction: column; /* stack arrows vertically */
        align-items: center;
        gap: 2px; /* remove gap so buttons sit closer */
        z-index: 30;
        width: 24px; /* fixed width so both buttons center to the same x-position */
    }

    .btn {
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0; /* remove horizontal padding to avoid visual shift */
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center; /* ensure both arrows are perfectly aligned */
        width: 24px;  /* match controls width */
        height: 16px; /* consistent height for each arrow button */
    }

    /* Make the second button 3px overlap to bring arrows 5px closer vs previous 2px gap */
    .btn + .btn { margin-top: -3px; }

    /* Do not show border/outline on mouse click; keep it for keyboard nav */
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: 2px solid #c9c9c9; outline-offset: 2px; }

    /* Arrow icon size increased by ~20% (10px → 12px); block so rotate centers perfectly */
    .arrowIcon {
        display: block;
        width: 12px;
        height: 12px;
        color: #c9c9c9;
        line-height: 0;
        transform-origin: 50% 50%;
        margin: 0 auto; /* ensure centered inside the fixed-width button */
    }
    .arrowIcon > svg { display: block; width: 12px; height: 12px; }

    .clear {
        cursor: pointer;
        position: absolute;
        color: #AAA;
        font-size: 0.8em;
        line-height: 0.9em;
        font-weight: normal;
        box-sizing: border-box;
        right: 44px; /* place clear close to the icon; arrows are further left */
        background-color: #EEE;
        padding: 5px 10px;
        z-index: 30;
        border-radius: 3px;
        top: 17px;
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

    .withRightIcon {
        padding-right: 44px;
    }
`

const STATE_SYMBOL = Symbol.for('stalefish.time.state')
const ID_MAP_SYMBOL = Symbol.for('stalefish.time.idMap')

function pad2 (n) { return (n < 10 ? '0' : '') + n }
function parseHM (str) {
  if (!str || typeof str !== 'string') return null
  const m = /^([0-9]{1,2}):([0-9]{2})$/.exec(str)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return { h, min }
}

// Normalize free-typed time so the user doesn't need to type ':'
// Behaviors:
// - Accept digits only and optional colon; we auto-insert ':' after hours
// - 1 digit: "H"
// - 2 digits: "HH:"
// - 3 digits: "0H:MM" (first digit hour, last two minutes)
// - 4+ digits: "HH:MM" (first two hour, next two minute), extras ignored
// - When full HH:MM is available, clamp to 23:59
function normalizeTypedTime (raw) {
  const s = (raw || '').toString().trim()
  const digits = (s.replace(/[^0-9]/g, '')).slice(0, 4)
  const len = digits.length
  if (len === 0) return { text: '', full: false }
  if (len === 1) return { text: digits, full: false }
  if (len === 2) return { text: `${digits}:`, full: false }
  if (len === 3) {
    // First digit is hour 0-9, next two are minutes
    const h = parseInt(digits.slice(0, 1), 10)
    let m = parseInt(digits.slice(1), 10)
    if (m > 59) m = 59
    const text = `${pad2(h)}:${pad2(m)}`
    return { text, full: true, h, min: m }
  }
  // len >= 4
  let h = parseInt(digits.slice(0, 2), 10)
  let m = parseInt(digits.slice(2, 4), 10)
  if (h > 23) h = 23
  if (m > 59) m = 59
  const text = `${pad2(h)}:${pad2(m)}`
  return { text, full: true, h, min: m }
}

function ensureState (holdingPen, property) {
  if (!holdingPen) return {}
  if (!holdingPen[STATE_SYMBOL]) {
    Object.defineProperty(holdingPen, STATE_SYMBOL, { value: {}, enumerable: false })
  }
  const map = holdingPen[STATE_SYMBOL]
  if (!map[property]) {
    // Initialize without numeric defaults so the first render can
    // derive tmpHour/tmpMinute from any pre-populated value in holdingPen[property].
    // Using numbers here (e.g. 0) prevents the later typeof checks from
    // pulling in the server-loaded time, which caused the initial arrow click
    // to jump from 00:00 to 00:15/23:45 regardless of the actual starting time.
    map[property] = { tmpHour: undefined, tmpMinute: undefined }
  }
  return map[property]
}

function ensureId (holdingPen, property, uniqueKey) {
  if (!holdingPen) return `sf-time-${property || Math.random().toString(36).slice(2)}`
  if (!holdingPen[ID_MAP_SYMBOL]) {
    Object.defineProperty(holdingPen, ID_MAP_SYMBOL, { value: {}, enumerable: false })
  }
  const map = holdingPen[ID_MAP_SYMBOL]
  if (!map[property]) {
    map[property] = `sf-time-${property}-${Math.random().toString(36).slice(2)}`
  }
  return `sf-time-${uniqueKey || map[property]}`
}

function commitValue ({ holdingPen, property, onchange, valueStr }) {
  const fauxE = { currentTarget: { validity: { valid: true }, value: valueStr } }
  formField(holdingPen, property)(fauxE)
  onchange && onchange(fauxE)
}

export default function timePicker ({
  wrapperStyle = null,
  holdingPen,
  label,
  placeholder,
  property,
  required,
  pattern,
  disabled,
  disableClear = false,
  minuteStep = 15,
  onchange,
  oninput,
  uniqueKey
} = {}) {
  const wrapperId = ensureId(holdingPen, property, uniqueKey)
  const state = ensureState(holdingPen, property)

  const currentStr = holdingPen && property ? holdingPen[property] : ''
  const now = new Date()
  const hm = parseHM(currentStr) || { h: now.getHours(), min: Math.floor(now.getMinutes() / minuteStep) * minuteStep }
  if (typeof state.tmpHour !== 'number') state.tmpHour = hm.h
  if (typeof state.tmpMinute !== 'number') state.tmpMinute = hm.min

  const stepMinute = (delta) => () => {
    // If stepping by 15 minutes, snap to quarters (00, 15, 30, 45) instead of adding to arbitrary minutes
    if (minuteStep === 15) {
      const dir = delta >= 0 ? 1 : -1
      let h = Number(state.tmpHour) || 0
      let m = Number(state.tmpMinute) || 0

      // Clamp m into [0,59]
      if (m < 0) m = 0
      if (m > 59) m = 59

      if (dir > 0) {
        // Move to the next quarter strictly greater than current minutes
        if (m < 15) m = 15
        else if (m < 30) m = 30
        else if (m < 45) m = 45
        else { m = 0; h = (h + 1) % 24 }
      } else {
        // Move to the previous quarter strictly less than current minutes
        if (m > 45) m = 45
        else if (m > 30) m = 30
        else if (m > 15) m = 15
        else if (m > 0) m = 0
        else { m = 45; h = (h + 24 - 1) % 24 }
      }

      state.tmpHour = h
      state.tmpMinute = m
      const valueStr = `${pad2(h)}:${pad2(m)}`
      commitValue({ holdingPen, property, onchange, valueStr })
      rerender()
      return
    }

    // Default behavior: roll minutes and hours together by delta minutes
    const total = ((state.tmpHour * 60 + state.tmpMinute + delta) % (24 * 60) + (24 * 60)) % (24 * 60)
    state.tmpHour = Math.floor(total / 60)
    state.tmpMinute = total % 60
    const valueStr = `${pad2(state.tmpHour)}:${pad2(state.tmpMinute)}`
    commitValue({ holdingPen, property, onchange, valueStr })
    rerender()
  }

  // Helpers for caret-preserving normalization
  function digitsCountBeforeCaret (text, caretIdx) {
    if (!text) return 0
    const left = text.slice(0, Math.max(0, caretIdx | 0))
    return (left.match(/[0-9]/g) || []).length
  }
  function caretIndexForDigits (digitCount, formattedText) {
    if (digitCount <= 0) return 0
    let seen = 0
    for (let i = 0; i < formattedText.length; i++) {
      if (/[0-9]/.test(formattedText[i])) {
        seen++
        if (seen === digitCount) return i + 1 // place caret after that digit
      }
    }
    return formattedText.length
  }

  const onTypedChange = (e) => {
    const inputEl = e && e.target
    const before = (inputEl?.value || '').trim()
    const inputType = e && e.inputType

    // If the user is deleting (backspace/delete), do not normalize or auto-commit.
    // Let the browser update the string naturally so digits don't jump positions.
    if (typeof inputType === 'string' && (inputType.startsWith('delete') || inputType === 'historyUndo' || inputType === 'historyRedo')) {
      oninput && oninput(e)
      return
    }
    // Snapshot caret before we change value
    const selStart = typeof inputEl?.selectionStart === 'number' ? inputEl.selectionStart : before.length
    const selEnd = typeof inputEl?.selectionEnd === 'number' ? inputEl.selectionEnd : selStart
    const isCaretAtEnd = selStart === before.length && selEnd === selStart
    const inputDigitsLen = before.replace(/[^0-9]/g, '').length

    // If the current text already contains a colon, treat it as mask editing (HH:MM)
    // Enforce max 2 digits per segment and perform true replacement for the edited segment.
    if (before.includes(':')) {
      const colonIdx = before.indexOf(':')
      // If the user selected across the colon (or the whole value) and starts typing,
      // treat it as a fresh entry so the first two digits go into hours, then minutes.
      const selectionSpansColon = (selStart <= colonIdx) && (selEnd > colonIdx)
      const typedChar0 = (typeof e.data === 'string' && e.data.length === 1 && /[0-9]/.test(e.data)) ? e.data : null
      if (selectionSpansColon && typedChar0 && e && e.inputType === 'insertText') {
        if (typeof inputEl?.value === 'string') {
          inputEl.value = typedChar0
          try {
            if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
              const raf = (typeof window.requestAnimationFrame === 'function')
                ? window.requestAnimationFrame.bind(window)
                : (fn) => setTimeout(fn, 0)
              raf(() => inputEl.setSelectionRange(1, 1))
            }
          } catch {}
        }
        oninput && oninput(e)
        return
      }
      const left = before.slice(0, colonIdx)
      const right = before.slice(colonIdx + 1)
      const hRawDigits = (left.match(/[0-9]/g) || []).join('')
      const mRawDigits = (right.match(/[0-9]/g) || []).join('')

      // Determine which segment is being edited based on caret/selection
      const targetIsMinutes = selEnd > colonIdx
      const typedChar = (typeof e.data === 'string' && e.data.length === 1 && /[0-9]/.test(e.data)) ? e.data : null
      const isInsertText = (e && e.inputType === 'insertText')

      // Build baseline digits (truncate to max length 2, but we will overwrite precisely below)
      const baseHours = hRawDigits.slice(0, 2)
      const baseMinutes = mRawDigits.slice(0, 2)

      // Helper to set value and caret within a segment
      const commitMaskWithCaret = (hDigits, mDigits, caretInMinutesIdx) => {
        const hText = hDigits
        const mText = mDigits
        const masked = `${hText}:${mText}`
        if (typeof inputEl?.value === 'string' && inputEl.value !== masked) {
          inputEl.value = masked
        }
        try {
          if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
            const raf = (typeof window.requestAnimationFrame === 'function')
              ? window.requestAnimationFrame.bind(window)
              : (fn) => setTimeout(fn, 0)
            raf(() => {
              const pos = (caretInMinutesIdx != null)
                ? Math.min(masked.length, masked.indexOf(':') + 1 + Math.max(0, caretInMinutesIdx))
                : Math.min(masked.length, Math.max(0, hText.length))
              inputEl.setSelectionRange(pos, pos)
            })
          }
        } catch {}
      }

      // Overwrite semantics while typing single digits inside a segment
      if (isInsertText && typedChar) {
        if (targetIsMinutes) {
          // The browser has already applied the typedChar to the input value at this point.
          // So we should NOT re-insert it. Instead, read current digits and clamp to 2.
          const minutesStart = colonIdx + 1
          const relStart = Math.max(0, Math.min(2, selStart - minutesStart))
          // Use digits as they exist after the browser edit
          let mDigits = mRawDigits
          // Keep at most 2 digits (prevents doubling like 12:44 when typing 124)
          mDigits = mDigits.slice(0, 2)
          // Place caret within minutes based on current caret relative position
          const caretInMinutes = Math.min(2, Math.max(0, relStart))
          commitMaskWithCaret(baseHours, mDigits, caretInMinutes)
          oninput && oninput(e)
          return
        } else {
          // Editing hours: same principle — do not re-insert the typedChar, just clamp
          const hoursStart = 0
          const relStart = Math.max(0, Math.min(2, selStart - hoursStart))
          let hDigits = hRawDigits
          hDigits = hDigits.slice(0, 2)
          const hText = hDigits
          const mText = baseMinutes
          const masked = `${hText}:${mText}`
          if (typeof inputEl?.value === 'string' && inputEl.value !== masked) {
            inputEl.value = masked
          }
          try {
            if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
              const raf = (typeof window.requestAnimationFrame === 'function')
                ? window.requestAnimationFrame.bind(window)
                : (fn) => setTimeout(fn, 0)
              raf(() => {
                const pos = Math.min(masked.length, Math.max(0, relStart))
                inputEl.setSelectionRange(pos, pos)
              })
            }
          } catch {}
          oninput && oninput(e)
          return
        }
      }

      // Fallback for non-insertText events (paste, drag, IME, etc.):
      // simply truncate to max 2 digits per segment from the left.
      const hDigits = baseHours
      const mDigits = baseMinutes

      // Build masked text without forcing zero-padding during typing
      const hText = hDigits
      const mText = mDigits
      const masked = `${hText}:${mText}`

      // If both segments have 1–2 digits and caret at the end, allow immediate commit
      const fullMaskAtEnd = /^\s*([0-9]{1,2}):([0-9]{1,2})\s*$/.test(masked) && isCaretAtEnd
      if (fullMaskAtEnd) {
        const mm = /^\s*([0-9]{1,2}):([0-9]{1,2})\s*$/.exec(masked)
        let h = parseInt(mm[1], 10)
        let min = parseInt(mm[2], 10)
        if (!Number.isFinite(h)) h = 0
        if (!Number.isFinite(min)) min = 0
        if (h > 23) h = 23
        if (min > 59) min = 59
        const valueStr = `${pad2(h)}:${pad2(min)}`
        if (typeof inputEl?.value === 'string' && inputEl.value !== valueStr) {
          inputEl.value = valueStr
        }
        state.tmpHour = h
        state.tmpMinute = min
        commitValue({ holdingPen, property, onchange, valueStr })
        rerender()
        return
      }

      // Otherwise, reflect the truncated masked value and keep caret inside the edited segment
      if (typeof inputEl?.value === 'string' && inputEl.value !== masked) {
        inputEl.value = masked
        try {
          if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
            const raf = (typeof window.requestAnimationFrame === 'function')
              ? window.requestAnimationFrame.bind(window)
              : (fn) => setTimeout(fn, 0)
            raf(() => {
              if (targetIsMinutes) {
                const start = (masked.indexOf(':') + 1)
                inputEl.setSelectionRange(start + mText.length, start + mText.length)
              } else {
                const start = 0
                inputEl.setSelectionRange(start + hText.length, start + hText.length)
              }
            })
          }
        } catch {}
      }
      oninput && oninput(e)
      return
    }

    // Special case: entry of exactly two digits with no ':' present should prefill minutes with 00
    // This should work even if the user previously used the arrow controls (i.e., not strictly "from scratch").
    // Example: user clicks field (with any existing value), types "12" → becomes "12:00" and caret moves after the colon.
    const hasColon = before.indexOf(':') !== -1
    {
      const digitsRaw = before.replace(/[^0-9]/g, '').slice(0, 4)
      if (digitsRaw.length === 2 && !hasColon) {
        let hh = parseInt(digitsRaw, 10)
        if (isNaN(hh)) hh = 0
        if (hh > 23) hh = 23
        const text = `${pad2(hh)}:00`
        if (inputEl && typeof inputEl.value === 'string' && inputEl.value !== text) {
          inputEl.value = text
          // Place caret just after the colon so next typing overwrites minutes
          try {
            if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
              const raf = (typeof window.requestAnimationFrame === 'function')
                ? window.requestAnimationFrame.bind(window)
                : (fn) => setTimeout(fn, 0)
              raf(() => { inputEl.setSelectionRange(3, 3) })
            }
          } catch (err) { /* ignore */ }
        }
        // Do not commit yet; allow subsequent typing to edit minutes naturally
        oninput && oninput(e)
        return
      }
    }

    const norm = normalizeTypedTime(before)

    // Only touch DOM value if it differs (prevents unnecessary caret jumps)
    if (inputEl && typeof inputEl.value === 'string' && inputEl.value !== norm.text) {
      inputEl.value = norm.text
      // Restore caret relative to digits so typing after ':' doesn't jump to end
      const digitsLeft = digitsCountBeforeCaret(before, selStart)
      const newCaret = caretIndexForDigits(digitsLeft, norm.text)
      try {
        // Wrap in rAF to let the value assignment settle in some browsers
        if (typeof window !== 'undefined' && inputEl.setSelectionRange) {
          const raf = (typeof window.requestAnimationFrame === 'function')
            ? window.requestAnimationFrame.bind(window)
            : (fn) => setTimeout(fn, 0)
          raf(() => {
            inputEl.setSelectionRange(newCaret, newCaret)
          })
        }
      } catch (err) { /* noop if browser disallows */ }
    }

    // Commit rules:
    // - If a full HH:MM is available and user is appending at the end, commit immediately (keeps old behavior)
    // - If user is editing in the middle (not at end), defer commit to blur/Enter to avoid caret jump
    // Do not auto-commit at the 3-digit stage (e.g., typing 120 → would yield 01:20)
    // Allow the 4th digit to be entered so 1200 → 12:00. Commit on 4 digits or on blur.
    const isThreeDigitStage = inputDigitsLen === 3

    if (norm.full && isCaretAtEnd && !isThreeDigitStage) {
      state.tmpHour = norm.h
      state.tmpMinute = norm.min
      commitValue({ holdingPen, property, onchange, valueStr: `${pad2(norm.h)}:${pad2(norm.min)}` })
      rerender()
    } else {
      // partial or mid-string edit – forward event for listeners; don't rerender so caret stays
      oninput && oninput(e)
    }
  }

  const finalizeTypedValue = (e) => {
    const v = (e?.target?.value || '').trim()
    const hasColon = v.indexOf(':') !== -1
    const digits = v.replace(/[^0-9]/g, '')
    if (digits.length === 0) {
      // Treat empty as a clear action when leaving the field
      commitValue({ holdingPen, property, onchange, valueStr: '' })
      rerender()
      return
    }

    // If a colon is present, parse as HH:MM preserving intended segments to avoid hour shifting
    if (hasColon) {
      const parts = v.split(':')
      const hDigits = (parts[0] || '').replace(/[^0-9]/g, '').slice(0, 2)
      const mDigitsRaw = (parts[1] || '').replace(/[^0-9]/g, '').slice(0, 2)
      if (hDigits.length === 0 && mDigitsRaw.length === 0) {
        commitValue({ holdingPen, property, onchange, valueStr: '' })
        rerender()
        return
      }
      let h = parseInt(hDigits || '0', 10)
      let m
      if (mDigitsRaw.length === 0) m = 0
      else if (mDigitsRaw.length === 1) m = parseInt(`0${mDigitsRaw}`, 10) // "2" → 02
      else m = parseInt(mDigitsRaw, 10)
      if (!Number.isFinite(h)) h = 0
      if (!Number.isFinite(m)) m = 0
      if (h > 23) h = 23
      if (m > 59) m = 59
      const valueStr = `${pad2(h)}:${pad2(m)}`
      state.tmpHour = h
      state.tmpMinute = m
      commitValue({ holdingPen, property, onchange, valueStr })
      if (e && e.target) e.target.value = valueStr
      rerender()
      return
    }

    // Determine existing minutes to preserve when user only edited hours
    const currentStr = holdingPen && property ? (holdingPen[property] || '') : ''
    const parsedCurrent = parseHM(currentStr)
    const preservedMinutes = (parsedCurrent && typeof parsedCurrent.min === 'number')
      ? parsedCurrent.min
      : (typeof state.tmpMinute === 'number' ? state.tmpMinute : 0)

    const norm = normalizeTypedTime(digits)
    // Ensure a full HH:MM
    let h = norm.h
    let m = norm.min
    if (!norm.full) {
      if (digits.length === 1) {
        // Single-hour digit typed; preserve minutes
        h = parseInt(digits, 10)
        m = preservedMinutes
      }
      if (digits.length === 2) {
        // Two-hour digits typed (e.g., "12" or "12:"); preserve minutes
        h = parseInt(digits, 10)
        m = preservedMinutes
      }
      // normalize bounds
      if (h > 23) h = 23
      if (m > 59) m = 59
    } else if (hasColon && (digits.length === 2 || digits.length === 1) && (typeof m !== 'number')) {
      // Safety: if input had a colon but normalization didn't produce minutes (shouldn't happen), preserve
      m = preservedMinutes
    }

    const valueStr = `${pad2(h)}:${pad2(m)}`
    state.tmpHour = h
    state.tmpMinute = m
    commitValue({ holdingPen, property, onchange, valueStr })
    // Update input immediately
    if (e && e.target) e.target.value = valueStr
    rerender()
  }

  const clearValue = (e) => {
    if (e) { e.stopPropagation(); e.preventDefault() }
    commitValue({ holdingPen, property, onchange, valueStr: '' })
    rerender()
    return false
  }

  const displayValue = holdingPen && property ? (holdingPen[property] || '') : ''

  const wrapperClassName = wrapperStyle
    ? (typeof wrapperStyle === 'string' ? wrapperStyle : (wrapperStyle && wrapperStyle.toString ? wrapperStyle.toString() : ''))
    : ''

  return html`
      <div id="${wrapperId}" class="${wrapperClassName}" style="min-height: 55px; display: inline-block; width: calc(100% - 10px); margin: 40px 5px 5px 5px;">
          <div style="display: inline-block; width: 100%; text-align: left; position: relative; padding: 0;">
              ${label ? html`<span class="${styles.label}" style="opacity: ${(holdingPen && (holdingPen[property] === 0 || holdingPen[property])) ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,0.8); position: absolute; top: -36px;">${label}${required ? ' *' : ''}</span>` : ''}
              ${!disableClear ? html`<div data-clear class="${styles.clear}" onclick=${clearValue}>clear</div>` : ''}
              <div class="${styles.icon}">${timeIcon({ colour: '#ccc', width: 20, height: 20 })}</div>
              <input data-gramm="false" ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}" class="${styles.textfield} ${styles.withRightIcon} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" ?required=${required}
                     onchange=${onTypedChange}
                     oninput=${onTypedChange}
                     onblur=${finalizeTypedValue}
                     onkeydown=${(ev) => {
                         if (ev.key === 'ArrowUp') {
                             ev.preventDefault()
                             stepMinute(minuteStep)()
                         } else if (ev.key === 'ArrowDown') {
                             ev.preventDefault()
                             stepMinute(-minuteStep)()
                         } else if (ev.key === 'Enter') {
                             ev.preventDefault()
                             finalizeTypedValue(ev)
                         }
                     }}
                     placeholder="${(placeholder || 'Time') + (required ? ' *' : '')}"
                     type="text" ${pattern ? { pattern } : ''}
                     .value=${displayValue} data-input />

              <div class="${styles.controls}">
                  <button type="button" tabindex="-1" class="${styles.btn}" onclick=${stepMinute(minuteStep)} aria-label="Increase time by ${minuteStep} minutes">
                      <span class="${styles.arrowIcon}" style="transform: rotate(180deg); display:inline-block;">${solidDown({ colour: '#ccc' })}</span>
                  </button>
                  <button type="button" tabindex="-1" class="${styles.btn}" onclick=${stepMinute(-minuteStep)} aria-label="Decrease time by ${minuteStep} minutes">
                      <span class="${styles.arrowIcon}" style="transform: rotate(0deg); display:inline-block;">${solidDown({ colour: '#ccc' })}</span>
                  </button>
              </div>
          </div>
      </div>
  `
}
