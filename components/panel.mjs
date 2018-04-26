import { html, css } from 'halfcab'
import close from './close'
import up from './up'
import down from './down'

let styles = css`
  .panel h2 {
    color: #22487e;
    font-size: 2em;
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

export default ({on = true, content = '', heading = '', closeAction = null, collapseToggleAction = null, collapsed = false, headerAction = null}) => html`${on ? html`<div style="position: relative;">
  ${heading ? html`<div class="${styles.header}" onclick=${() => headerAction && headerAction()}>
    <h2 style="margin: 12px; user-select: none;">SnoCountry</h2>
  </div>` : ''}
  
  ${closeAction && !collapseToggleAction ? html` <div style="position: absolute; width: 20px; height: 20px; right: 5px; top: 5px; cursor: pointer;" onclick=${closeAction}><div style="display: flex; justify-content: center; align-items: center;">${close({colour: '#22487e'})}</div></div>` : ''}
  
  ${collapseToggleAction ? html` <div style="position: absolute; width: 50px; height: 50px; right: 0px; top: 5px; cursor: pointer;" onclick=${collapseToggleAction}><div style="display: flex; justify-content: center; align-items: center;">${collapsed ? down({colour: '#22487e', width: '40px', height: '50px'}) : up({colour: '#22487e', width: '40px', height: '40px'})}</div></div>` : ''}

  ${collapsed === false ? content : ''}
</div>` : ''}`