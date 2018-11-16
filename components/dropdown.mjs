import {html, css} from 'halfcab'

let styles = css`

  .dropdown {
    position: relative;
    display: inline-block;
  }
  
  .dropdown:focus{
    outline:0;
  }
  
  .dropdownContent {
    position: absolute;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
  }
  
  .dropdownContent div {
    color: #666;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
    cursor: pointer;
    font-size: 18px;
  }
  
  .dropdownContent div:hover {background-color: #f1f1f1}
  
  .separator{
    border-color: #c9c9c9;
    margin: 0;
    border-style: solid;
  }
`

export default ({menuItems, visible, side, width, margin, backgroundColour, uniqueKey}) => html`

<div tabindex="-1" class="${styles.dropdown}" style="position: relative; z-index: 100000; ${!visible ? 'display: none;' : ''}${side === 'right' ? 'float: right;' : ''}">
  <div class="${styles.dropdownContent}" style="background-color: ${backgroundColour || '#f9f9f9'}; ${side === 'right' ? 'right: 0;' : ''} width: ${width || '160px'};${margin ? `margin: ${margin};` : ''}">
  ${menuItems.filter(item => !item.visibleUnder || (item.visibleUnder && typeof window !== 'undefined' && window.innerWidth <= parseInt(item.visibleUnder))).map(item => html`
    ${item.separator ? html`<hr class="${styles.separator}">` : html`<div onclick=${item.action}>${item.text}</div>`}
  `)}
  </div>
</div>   
`
