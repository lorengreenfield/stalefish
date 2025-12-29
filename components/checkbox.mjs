import { html, css, formField, fieldIsTouched } from 'halfcab'

let styles = css`
    .checkbox {
        margin: 0 10px 0 20px !important;
        position: absolute;
        right: 4px;
        top: 16.5px;
    }

    .label {
        position: relative;
        display: inline-flex;
        align-items: center;
        border-radius: 0;
        font-size: 18px;
        font-weight: normal;
        color: #999;
        margin: 5px 5px 5px 5px;
        border: solid 5px #c9c9c9;
        user-select: none;
        padding: 12px;
        box-sizing: border-box;
        width: calc(100% - 10px);
    }

    .checkbox.touched:invalid:not(:focus) {
        outline: red solid 2px;
    }
`

export default ({ wrapperStyle, holdingPen, label, property, required, indeterminate, disabled, darkBackground, onchange }) => {
  let checkboxEl = html`<input data-gramm="false" ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed;' : ''}" class="${styles.checkbox} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" value="${holdingPen[property] === true ? 'true' : null}" ?checked=${holdingPen[property] === true} onchange=${e => {
      formField(holdingPen, property)(e)
      onchange && onchange(e)
  }} type="checkbox" ?required=${required} />`

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
