import { html, css, fieldIsTouched } from 'halfcab'
import uploadIcon from './icons/upload.mjs'

const styles = css`
  .uploader {
    margin: 0 10px 0 20px !important;
    position: absolute;
    right: 4px;
    top: 16.5px;
  }
  
  .clear {
    cursor: pointer;
    position: absolute;
    color: #AAA;
    font-size: 0.8em; 
    line-height: 0.9em;
    font-weight: normal; 
    box-sizing: border-box;
    background-color: #EEE; 
    padding: 5px 10px;
    z-index: 30;
    border-radius: 3px;
    right: 54px; 
    top: 0px;
  }
  
  .icon {
    position: absolute;
    pointer-events: none;
    color: #c9c9c9;
    right: 17px; 
    top: -6px;
    font-size: 2em;
    z-index: 30;
  }
  
  .frame {
    position: relative;
    display: inline-flex; 
    align-items: center;
    border-radius: 0;
    font-size: 18px; 
    font-weight: normal; 
    color: #999; 
    margin: 5px 5px 5px 5px;
    padding: 10px;
    background-color: rgba(255,255,255,0.8);
    border: solid 5px #c9c9c9;
    user-select: none;
    padding: 12px; 
    box-sizing: border-box;
    width: calc(100% - 10px);
    z-index: 20;
  }
  
  .label {
    transition: opacity 0.75s;
    border-top-right-radius: 5px; 
    border-top-left-radius: 5px;
    user-select: none;
    
    font-size: 16px; 
    font-weight: normal; 
    color: #999; 
    margin-left: 5px; 
    padding: 9px; 
    background-color: rgba(255,255,255,0.8); 
    position: absolute;
    top: -55px;
    left: 5px;
    z-index: 10;
  }
  
  .uploader.touched:invalid:not(:focus) {
    outline: red solid 2px;
  }
`
/**
 * Functional uploader component compatible with halfcab's lit-html base.
 * No internal instance caching; simply returns a template.
 */
export default function uploader (args) {
  const {
    wrapperStyle,
    holdingPen,
    label,
    property,
    required,
    disabled,
    accept,
    imagePreview,
    disableClear,
    placeholder,
    permanentTopLabel,
    permanentTopPlaceholder,
    textPreview,
    progress,
    onchange,
    onclear
  } = args

  const uploaderEl = html`<input data-gramm="false" ${disabled ? { disabled } : ''} style="${disabled ? 'cursor: not-allowed;' : ''}" class="${styles.uploader} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" onchange=${onchange} type="file" ${required ? { required: 'required' } : ''} ${accept ? { accept } : ''} hidden />`

  return html`
    <div ${wrapperStyle ? { class: wrapperStyle } : ''} style="display: inline-block; width: 100%; margin-top: 36px;">
      <label style="width: 100%; text-align: left; position: relative; padding: 0; cursor: pointer;">
        ${label ? html`<span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || (permanentTopPlaceholder || permanentTopLabel) ? 1 : 0};">${label}${required ? ' *' : ''}</span>` : ''}
        <span class="${styles.frame}">
          ${!holdingPen[property]
            ? html`${placeholder}${required ? ' *' : ''}`
            : !imagePreview
              ? (textPreview || holdingPen[property])
              : '\u00A0'}
          ${uploaderEl}
          <span style="opacity: 0.6; margin-left: -12px; width: ${progress}%; position: absolute; background-color: #EEE; height: 100%;"></span>
        </span>
        ${imagePreview ? html`<img src="${imagePreview}" style="position: absolute; height: 35px; top: -9px; left: 20px; z-index: 30;"/>` : ''}
        ${!disableClear ? html`<div class="${styles.clear}" onclick=${onclear}>clear</div>` : ''}
        <div class="${styles.icon}">${uploadIcon({ colour: '#ccc', width: 28, height: 28 })}</div>
      </label>
    </div>
  `
}
