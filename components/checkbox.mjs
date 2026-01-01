import { html, css, formField, fieldIsTouched } from 'halfcab'

const styles = css`
    .checkbox {
        margin: 0 10px 0 20px !important;
        position: absolute;
        right: 4px;
        top: 16.5px;
    }

    /* Do not show native blue focus ring on the actual checkbox; we use the
       outer label's darker border (.activeFocus) as the visual focus cue. */
    .checkbox:focus { outline: none; box-shadow: none; }
    .checkbox:focus-visible { outline: none; box-shadow: none; }

    .label {
        position: relative;
        display: inline-flex;
        align-items: center;
        border-radius: 0;
        font-size: 18px;
        font-weight: normal;
        color: #666;
        margin: 5px 5px 5px 5px;
        border: solid 5px #c9c9c9;
        user-select: none;
        padding: 12px;
        box-sizing: border-box;
        width: calc(100% - 10px);
    }

    /* Programmatic visual focus/active indicator to match other fields */
    .activeFocus {
        border: solid 5px #969696;
    }

    .checkbox.touched:invalid:not(:focus) {
        outline: red solid 2px;
    }
`

export default ({ wrapperStyle, holdingPen, label, property, required, indeterminate, disabled, darkBackground, onchange }) => {
  const addActive = (e) => {
    if (!e) return
    const wrapper = e.target && typeof e.target.closest === 'function' && e.target.closest('label')
    if (!wrapper) return
    const box = wrapper.querySelector('.' + styles.label)
    if (box && box.classList) box.classList.add(styles.activeFocus)
  }
  const removeActive = (e) => {
    if (!e) return
    const wrapper = e.target && typeof e.target.closest === 'function' && e.target.closest('label')
    if (!wrapper) return
    const box = wrapper.querySelector('.' + styles.label)
    if (box && box.classList) box.classList.remove(styles.activeFocus)
  }

  const checkboxEl = html`<input data-gramm="false" ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed;' : ''}" class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ?checked=${holdingPen[property] === true}
    onchange=${e => { formField(holdingPen, property)(e); onchange && onchange(e); addActive(e) }}
    onfocus=${e => { addActive(e) }}
    onblur=${e => { removeActive(e) }}
    onclick=${e => { addActive(e) }}
    type="checkbox" ?required=${required} />`

  checkboxEl.indeterminate = indeterminate || false

  const wrapperClassName = wrapperStyle
    ? (typeof wrapperStyle === 'string' ? wrapperStyle : (wrapperStyle.toString ? wrapperStyle.toString() : ''))
    : ''

  return html`
      <label style="${disabled ? 'cursor: not-allowed; opacity: 0.3;' : ''}text-align: left; width: 100%; display: inline-block; vertical-align: bottom;" class="${wrapperClassName}">
          <span class="${styles.label}" style="background-color: rgba(255,255,255,${darkBackground ? 1 : 0.8});">${label}${required ? ' *' : ''}${checkboxEl}</span>
      </label>
  `
}
