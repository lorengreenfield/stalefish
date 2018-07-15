import { html, css } from 'halfcab'
import close from './close'
import up from './up'
import down from './down'

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
  }
`

export default ({chevronStyle = null, on = true, content = () => '', heading = '', closeAction = null, collapseToggleAction = null, collapsed = false, headerAction = null, thinBorder = false, light = false}) => html`${on ? html`<div class="${styles.panel}" style='box-sizing: border-box; position: relative; top: 0px; left: 0px; text-align: left; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); border: solid ${thinBorder ? '3px' : '5px'} ${light ? '#DDD' : '#4371AD'}; background-color: #FBFBFB;'><div style="position: relative;">
  ${heading ? html`<div class="${styles.header}" onclick=${() => headerAction && headerAction()}>
    <h3 style="margin: 12px; user-select: none; -moz-user-select: none; -webkit-user-select: none; -ms-user-select: none; color: ${light ? '#555' : '#22487e'}">${heading}</h3>
  </div></div>` : ''}
  
  ${closeAction && !collapseToggleAction ? html`<div style="position: absolute; width: 20px; height: 20px; right: 5px; top: 5px; cursor: pointer;" onclick=${closeAction}><div style="display: flex; justify-content: center; align-items: center;">${close({colour: '#22487e'})}</div></div>` : ''}
  
  ${collapseToggleAction ? html` <div ${chevronStyle ? {'class': chevronStyle} : ''} style="position: absolute; width: 50px; height: 50px; right: 0px; margin-top: -3px; top: 5px; cursor: pointer;" onclick=${collapseToggleAction}><div style="display: flex; justify-content: center; align-items: center;">${collapsed ? down({colour: light ? '#999' : '#22487e', width: '40px', height: '50px'}) : up({colour: light ? '#999' : '#22487e', width: '40px', height: '40px'})}</div></div>` : ''}

  ${collapsed === false ? typeof content === 'function' ? content() : '' : ''}
</div>` : ''}`
