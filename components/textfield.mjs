import { html, css, formField, fieldIsTouched, rerender } from 'halfcab'
import solidDown from './icons/solidDown.mjs'
// language=CSS
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
        color: #666;
    }

    /* Provide room for custom right-side controls when present */
    .withRightControls { padding-right: 32px; }
    /* Legacy fixed padding when valueContext present (no longer used; kept for backward compat) */
    .withRightControlsAndValueContext { padding-right: 114px; }

    .label {
        transition: opacity 0.75s;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        user-select: none;
        position: absolute;
        top: -55px;
        z-index: 10;
    }

    /* Color input slightly shifts internal box metrics; lift label by ~6px for perfect alignment */
    .labelColorAdjustForColorType {
        top: -61px;
    }

    .textfield.highlight {
        border-color: #ff4081;
    }

    .textfield:focus {
        border: solid 5px #969696;
    }

    /* Programmatic visual focus when clicking custom controls or related UI */
    .activeFocus {
        border: solid 5px #969696;
    }

    .textfield::placeholder {
        color: #999;
    }

    .textfield.touched:invalid:not(:focus) {
        border-color: red;
    }

    /* Normalize native color input height to match other fields (55px)
       Use the same padding as other textfields so overlay elements (label/valueContext)
       align identically regardless of type. */
    input[type="color"].textfield {
        height: 55px;            /* match date/time/text visual height */
        padding: 10px;           /* match standard textfield padding to avoid vertical shift */
    }
    /* WebKit-specific internals to remove extra inset spacing/border */
    input[type="color"].textfield::-webkit-color-swatch-wrapper { padding: 0; }
    input[type="color"].textfield::-webkit-color-swatch { border: none; }

    .valueContext {
        position: absolute;
        color: #AAA;
        font-size: 1.1em;
        /* Enforce exact badge height and vertical centering */
        height: 42px;
        line-height: 42px;
        font-weight: normal;
        box-sizing: border-box;
        top: -12px;
        right: 7px;
        background-color: #EEE;
        /* Horizontal padding only so height remains exactly 42px */
        padding: 0 10px;
        z-index: 30;
    }

    /* Custom up/down controls (aligned with datePicker/timePicker) */
    .controls {
        position: absolute;
        right: 6px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        z-index: 30;
        width: 24px;
        pointer-events: auto;
    }

    /* Dynamic positioning is handled via JS when valueContext is present */
    .controlsWithValueContext { right: 80px; }

    .btn {
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 0;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 16px;
    }
    .btn + .btn { margin-top: -3px; }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: 2px solid #c9c9c9; outline-offset: 2px; }

    /* Match requested styling: light grey (#CCC) and ~40% smaller (12px -> 7px) */
    .arrowIcon { display: block; width: 7px; height: 7px; color: #CCC; line-height: 0; transform-origin: 50% 50%; margin: 0 auto; }
    .arrowIcon > svg { display: block; width: 7px; height: 7px; }

    /* Hide native number spinners for consistency across browsers */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
`

function change ({ e, holdingPen, property, label }) {
  const ff = formField(holdingPen, property)(e)

  // When programmatically changing via custom arrows we may not have e.target
  // Guard DOM lookups so we don't throw and skip label opacity tweaks in that case
  const target = e && (e.target || e.currentTarget)
  const canQuery = target && typeof target.closest === 'function'
  if (canQuery) {
    const closestLabel = target.closest('label')
    if (closestLabel) {
      const labelEl = label && label.selector ? closestLabel.querySelector(label.selector) : null
      if (labelEl) {
        if (holdingPen[property] === 0 || holdingPen[property]) {
          labelEl.style.opacity = 1
        } else {
          labelEl.style.opacity = 0
        }
      }
    }
  }

  return ff
}

function determineType (type) {
  // Normalize and guard against undefined/null/non-string values
  const t = (typeof type === 'string' ? type : (type != null ? String(type) : 'text'))
  const tl = t.toLowerCase()

  if (tl === 'float' || tl === 'integer') return 'number'
  if (tl === 'string') return 'text'
  if (tl === 'input') return 'text'
  return t || 'text'
}

function determineStep (type) {
  const tl = typeof type === 'string' ? type.toLowerCase() : ''
  if (tl === 'float' || tl === 'number') return '0.1'
  return '1'
}

export default ({ highlightBorder = false, wrapperStyle = null, holdingPen, label, placeholder, property, required, pattern, type, autofocus, valueContext, permanentTopPlaceholder = false, permanentTopLabel = false, disabled, maxCharacters, maxNumber, minNumber, darkBackground, onkeyup, oninput, onchange }) => {
  // Generate a stable wrapper id per holdingPen+property to enable DOM measurement for dynamic positioning
  const TF_ID_MAP_SYMBOL = Symbol.for('stalefish.textfield.idMap')
  function ensureId (holding, prop) {
    if (!holding) return `sf-textfield-${prop || Math.random().toString(36).slice(2)}`
    if (!holding[TF_ID_MAP_SYMBOL]) {
      Object.defineProperty(holding, TF_ID_MAP_SYMBOL, { value: {}, enumerable: false })
    }
    const map = holding[TF_ID_MAP_SYMBOL]
    if (!map[prop]) {
      map[prop] = `sf-textfield-${prop}-${Math.random().toString(36).slice(2)}`
    }
    return map[prop]
  }

  const wrapperId = ensureId(holdingPen, property)
  const normalizedType = determineType(type)
  const isNumber = normalizedType === 'number'
  const isInteger = typeof type === 'string' && type.toLowerCase() === 'integer'
  // Hide valueContext when type is color (design requirement)
  const hasValueContext = !!valueContext && normalizedType !== 'color'

  // Increment/decrement logic for custom controls
  const coerce = (val) => {
    if (val === '' || val === null || val === undefined) return null
    const n = Number(val)
    return Number.isFinite(n) ? n : null
  }
  // Derive step details and use scaled integer math to avoid FP artifacts (e.g., 3.3000000000000003)
  const stepStr = determineStep(normalizedType)
  const stepDp = isInteger ? 0 : (String(stepStr).includes('.') ? (String(stepStr).split('.')[1] || '').length : 0)
  const scale = Math.pow(10, stepDp)
  const stepInt = isInteger ? 1 : Math.round(Number(stepStr) * scale) // integer number of scaled units per step
  const clamp = (n) => {
    if (typeof maxNumber === 'number' && n > maxNumber) n = maxNumber
    if (typeof minNumber === 'number' && n < minNumber) n = minNumber
    return n
  }
  const setValue = (newVal) => {
    // Provide a faux event compatible with formField and our guarded change()
    const faux = { currentTarget: { value: String(newVal), type: normalizedType, validity: { valid: true } } }
    change({ e: faux, holdingPen, property, label: styles.label })
    onchange && onchange(faux)
    rerender()
  }

  // Briefly emphasize focus styling when interacting via custom arrows
  const pulseActive = () => {
    if (typeof window === 'undefined') return
    setTimeout(() => {
      const el = document.getElementById(`${wrapperId}-input`)
      if (!el || el.disabled) return
      try { el.focus && el.focus({ preventScroll: true }) } catch (e) {}
      el.classList && el.classList.add(styles.activeFocus)
      setTimeout(() => { el && el.classList && el.classList.remove(styles.activeFocus) }, 400)
    }, 0)
  }
  const inc = () => {
    const cur = coerce(holdingPen[property])
    const base = cur == null ? (typeof minNumber === 'number' ? minNumber : 0) : cur
    let next
    if (isInteger) {
      next = Math.trunc(base + 1)
    } else {
      const scaled = Math.round(base * scale)
      next = (scaled + stepInt) / scale
      next = Number(next.toFixed(stepDp))
    }
    next = clamp(next)
    setValue(next)
    pulseActive()
  }
  const dec = () => {
    const cur = coerce(holdingPen[property])
    const base = cur == null ? (typeof minNumber === 'number' ? minNumber : 0) : cur
    let next
    if (isInteger) {
      next = Math.trunc(base - 1)
    } else {
      const scaled = Math.round(base * scale)
      next = (scaled - stepInt) / scale
      next = Number(next.toFixed(stepDp))
    }
    next = clamp(next)
    setValue(next)
    pulseActive()
  }

  const input = html`<input data-gramm="false"
                            ?disabled=${disabled}
                            ${maxNumber ? { max: maxNumber } : ''}
                            ${minNumber ? { min: minNumber } : ''}
                            ${maxCharacters ? { maxlength: maxCharacters } : ''}
                            style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}"
                            id="${wrapperId}-input"
                            class="${styles.textfield} ${isNumber ? styles.withRightControls : ''} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''} ${highlightBorder ? styles.highlight : ''}"
                            value="${holdingPen[property] !== undefined && holdingPen[property] !== null ? holdingPen[property] : ''}"
                            onkeyup=${e => { onkeyup && onkeyup(e); if (isNumber && e && e.key === 'ArrowUp') { e.preventDefault && e.preventDefault(); inc() } else if (isNumber && e && e.key === 'ArrowDown') { e.preventDefault && e.preventDefault(); dec() } }}
                            ?required=${required}
                            onchange=${e => { change({ e, holdingPen, property, label: styles.label }); onchange && onchange(e) }}
                            oninput=${e => { change({ e, holdingPen, property, label: styles.label }); oninput && oninput(e) }}
                            onblur=${formField(holdingPen, property)}
                            placeholder="${placeholder || ''}${required ? ' *' : ''}"
                            type="${normalizedType}"
                            ${pattern ? { pattern } : ''}
                            ${isNumber ? { step: determineStep(normalizedType) } : ''}
  />`

  if (autofocus) {
    input.autofocus = true
  }

  const wrapperClassName = wrapperStyle
    ? (typeof wrapperStyle === 'string' ? wrapperStyle : (wrapperStyle.toString ? wrapperStyle.toString() : ''))
    : ''

  // Dynamically position the custom up/down controls 10px to the left of valueContext (if present)
  if (typeof window !== 'undefined') {
    const applyLayout = () => {
      if (!hasValueContext) return
      const vc = document.getElementById(`${wrapperId}-vc`)
      const ctrls = document.getElementById(`${wrapperId}-ctrls`)
      const inputEl = document.getElementById(`${wrapperId}-input`)
      if (!vc || !ctrls) return
      const badgeWidth = vc.offsetWidth || 0
      const rightOffset = 7 + badgeWidth + 10 // valueContext right is 7px; keep 10px gap
      ctrls.style.right = rightOffset + 'px'
      if (inputEl) {
        const safety = 10
        const arrowsWidth = 24
        inputEl.style.paddingRight = (rightOffset + arrowsWidth + safety) + 'px'
      }
    }
    // Schedule after render
    setTimeout(applyLayout, 0)
    // Observe badge width changes
    setTimeout(() => {
      if (!hasValueContext) return
      const vc = document.getElementById(`${wrapperId}-vc`)
      if (vc && typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') {
        const ro = new window.ResizeObserver(() => applyLayout())
        ro.observe(vc)
      }
      window.addEventListener('resize', applyLayout)
    }, 0)
  }

  return html`
      <div id="${wrapperId}" class="${wrapperClassName}" style="display: inline-block; width: calc(100% - 10px); margin: ${label ? '40' : '5'}px 5px 5px 5px;">
          <label style="width: 100%; text-align: left; position: relative; padding: 0;">
              ${hasValueContext ? html`<div id="${wrapperId}-vc" data-vc class="${styles.valueContext}">${valueContext}</div>` : ''}
              ${label ? html`<span class="${styles.label} ${normalizedType === 'color' ? styles.labelColorAdjustForColorType : ''}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || (permanentTopPlaceholder || permanentTopLabel) ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,${darkBackground ? 1 : 0.8}); ">${label}${required ? ' *' : ''}</span>` : ''}
              ${input}
              ${
                      (isNumber && !disabled)
                              ? html`
                                  <span id="${wrapperId}-ctrls" class="${styles.controls} ${hasValueContext ? styles.controlsWithValueContext : ''}" aria-hidden="false">
                        <button type="button" tabindex="-1" aria-label="Increase value" class="${styles.btn}" style="transform: rotate(180deg);" onmousedown=${(e) => e.preventDefault()} onclick=${inc}>${solidDown({ colour: '#CCC', width: '14px', height: '14px' })}</button>
                        <button type="button" tabindex="-1" aria-label="Decrease value" class="${styles.btn}" onmousedown=${(e) => e.preventDefault()} onclick=${dec}>${solidDown({ colour: '#CCC', width: '14px', height: '14px' })}</button>
                      </span>
                              `
                              : ''
              }
          </label>
      </div>
  `
}
