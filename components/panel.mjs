import { html, css } from 'halfcab'
import close from './icons/close.mjs'
import up from './icons/up.mjs'
import down from './icons/down.mjs'
import moreVertical from './icons/moreVertical.mjs'
import dropdown from './dropdown.mjs'

let styles = css`
    .panel h3 {
        font-weight: bold;
    }

    .wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 10px;
        box-sizing: border-box;
    }

    .innerWrapper {
        width: 100%;
        max-width: 600px;
    }

    .header {
        display: flex;
        justify-content: left;
        background-color: #F9F9F9;
        align-content: center;
        user-select: none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none;
        cursor: default;
    }
`

export default ({ chevronStyle = null, on = true, content, heading = '', collapsed = false, thinBorder = false, light = false, optionsMenu, tooltipHeading = false, headerAction, dragStartAction, dragOverAction, dragEndAction, dragLeaveAction, draggable, collapseToggleAction, closeAction }) => {
  return on ? html`<div ondragover=${e => {
      if (dragOverAction) {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
      }
  }} class="${styles.panel}" style='box-sizing: border-box; position: relative; top: 0; left: 0; text-align: left; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); border: solid ${thinBorder ? '3px' : '5px'} ${light ? '#DDD' : '#4371AD'}; background-color: #FBFBFB;'>
      <div title="${tooltipHeading && collapsed ? heading : ''}" style="position: relative;" ondragleave="${e => dragLeaveAction && dragLeaveAction(e)}" ondragend="${e => dragEndAction && dragEndAction(e)}" ondragover="${e => dragOverAction && dragOverAction(e)}" ondragstart="${e => dragStartAction && dragStartAction(e)}" draggable="${draggable ? 'true' : ''}" >
          ${heading ? html`<div class="${styles.header}" onclick=${e => headerAction && headerAction(e)}>
              <h3 style="margin: 12px; max-width: calc(100% - ${optionsMenu ? '70' : '50'}px); color: ${light ? '#555;' : '#22487e'} ${collapsed ? 'text-overflow: ellipsis; white-space: nowrap; overflow: hidden;' : ''}">${heading}</h3>

              ${optionsMenu ? html`<div style="position: absolute; right: 45px; top: 13px;">
                  <div style="user-select: none; -ms-user-select: none; -webkit-user-select: none; -moz-user-select: none; cursor: pointer; width: 24px; height: 24px;" onclick=${optionsMenu.action} aria-label="Options menu">
                      ${moreVertical({ colour: '#ccc' })}
                  </div>
                  ${dropdown({
                      side: 'right',
                      width: '200px',
                      margin: '5px',
                      visible: optionsMenu.on,
                      menuItems: optionsMenu.menuItems,
                      backgroundColour: 'white'
                  })}
              </div>` : ''}
          </div>` : ''}
      </div>
      ${closeAction && !collapseToggleAction ? html`<div style="position: absolute; width: 20px; height: 20px; right: 5px; top: 5px; cursor: pointer;" onclick=${closeAction}><div style="display: flex; justify-content: center; align-items: center;">${close({ colour: '#22487e' })}</div></div>` : ''}

      ${collapseToggleAction ? html`<div ${chevronStyle ? { 'class': chevronStyle } : ''} style="position: absolute; width: 50px; height: 50px; right: 0; margin-top: -3px; top: 5px; cursor: pointer;" onclick=${collapseToggleAction}><div style="display: flex; justify-content: center; align-items: center;">${collapsed ? down({ colour: light ? '#999' : '#22487e', width: '40px', height: '50px' }) : up({ colour: light ? '#999' : '#22487e', width: '40px', height: '40px' })}</div></div>` : ''}

      ${collapsed === false ? typeof content === 'function' ? content() : content : ''}
  </div>` : ''
}
