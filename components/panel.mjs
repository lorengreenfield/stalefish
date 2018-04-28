import { html, css } from 'halfcab'
import close from './close'
import up from './up'
import down from './down'

let styles = css`
  .panel h2 {
    color: #22487e;
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
    justify-content: center; 
    background-color: #EDEDED; 
    align-content: center;
  }
  
  @media (max-width: 540px) {
    .header {
      justify-content: flex-start;
    }
  }
`

export default ({on = true, content = '', heading = '', closeAction = null, collapseToggleAction = null, collapsed = false, headerAction = null}) => html`${on ? html`<div class="${styles.panel}" style='margin: 10px; box-sizing: border-box; position: relative; top: 0px; left: 0px; text-align: left; box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12); border: solid 5px #4371AD; background-color: #FBFBFB;'><div style="position: relative;">
  ${heading ? html`<div class="${styles.header}" onclick=${() => headerAction && headerAction()}>
    <h2 style="margin: 12px; user-select: none; text-transform: capitalize;">${heading}</h2>
  </div></div>` : ''}
  
  ${closeAction && !collapseToggleAction ? html`<div style="position: absolute; width: 20px; height: 20px; right: 5px; top: 5px; cursor: pointer;" onclick=${closeAction}><div style="display: flex; justify-content: center; align-items: center;">${close({colour: '#22487e'})}</div></div>` : ''}
  
  ${collapseToggleAction ? html` <div style="position: absolute; width: 50px; height: 50px; right: 0px; top: 5px; cursor: pointer;" onclick=${collapseToggleAction}><div style="display: flex; justify-content: center; align-items: center;">${collapsed ? down({colour: '#22487e', width: '40px', height: '50px'}) : up({colour: '#22487e', width: '40px', height: '40px'})}</div></div>` : ''}

  ${collapsed === false ? content : ''}
</div>` : ''}`