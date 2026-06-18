import { html, css, formField, fieldIsTouched, rerender } from 'halfcab'

let styles = css`
    .textarea {
        color: #666;
        padding: 10px;
        border: solid 5px #c9c9c9;
        transition: border 0.3s;
        outline: none;
        font-size: 18px;
        border-radius: 0;
        box-shadow: none !important;
        font-weight: normal;
        margin: 24px 5px 5px 5px;
        font-family: inherit;
        line-height: inherit;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        box-sizing: border-box;
        width: calc(100% - 10px);
        resize: vertical;
    }

    .label {
        transition: opacity 0.75s;
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
        user-select: none;
        position: relative;
        top: 14px;
        left: 5px
    }

    .textarea:focus {
        border: solid 5px #969696;
    }

    .textarea::placeholder {
        color: #999;
    }

    .textarea.touched:invalid:not(:focus) {
        border-color: red;
    }
`

function change ({ e, holdingPen, property, label }) {
  let ff = formField(holdingPen, property)(e)

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

export default ({ holdingPen, label, placeholder, property, required, pattern, onkeyup, autofocus, permanentTopPlaceholder = false, permanentTopLabel = false, disabled, darkBackground, onchange, height, oninput, element }) => {
  let input = html`<textarea data-gramm="false" style="${height ? `height: ${height}` : ''}" class="${styles.textarea} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" onkeyup=${e => onkeyup && onkeyup(e)} ?required=${required} onchange=${e => { change({ e, holdingPen, property, label: styles.label }); onchange && onchange(e); rerender() }} oninput=${e => { if (element) { height = window.getComputedStyle(element.querySelector('textarea')).height } change({ e, holdingPen, property, label: styles.label }); oninput && oninput(e); rerender() }} onblur=${formField(holdingPen, property)} placeholder="${placeholder || ''}${required ? ' *' : ''}" ${pattern ? { pattern } : ''}>${holdingPen[property] || ''}</textarea>`

  if (autofocus) {
    input.autofocus = true
  }

  return html`
      <label ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}width: 100%; text-align: left; display: inline-block;"><span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || (permanentTopPlaceholder || permanentTopLabel) ? 1 : 0}; font-size: 16px; font-weight: normal; color: #999; margin-left: 5px; padding: 9px; background-color: rgba(255,255,255,${darkBackground ? 1 : 0.8}); ">${label}${required ? ' *' : ''}</span>${input}</label>
  `
}
