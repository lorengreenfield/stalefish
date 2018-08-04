import { html, css } from 'halfcab'

let styles = css`
  .fab {
    transition: bottom 0.2s ease;
    padding: 0;
    z-index: 19000;
    outline: none;
    border: none;
    border-radius: 50%;
    font-family: inherit; 
    line-height: inherit; 
    cursor: pointer;
    color: white;
    font-size: 17px;
    position: fixed; 
    right: 15px;
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
  }
  
  
  .menuItem {
    width: auto;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-end;
    align-items: center;
    margin-bottom : 15px;
  }
  
  .menuItemButton {
    outline: none;
    border: none;
    cursor: pointer;
    font-family: inherit; 
    line-height: inherit; 
    border-radius: 50%;
    box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
    position: relative;
    transition: right 0.2s ease;
  }
  
  .menuItemLabel {
    user-select: none;
    color: #666;
    padding: 5px;
    margin-right: 15px;
    background-color: rgba(245,245,245,0.8);
    border-radius: 4px;
    box-shadow: 0px 0px 5px -1px rgba(0, 0, 0, 0.2), 0px 3px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12);
    transition: opacity 0.6s ease;
  }
  
  .menu {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 15px;
    bottom: 100px;
  }
`
export default ({diameter, text, action, colour, disabled, on, icon, menuItems, menuOpen}) => html`<div>
<div style="${!menuOpen ? 'visibility: hidden;' : ''} position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background-color: rgba(240,240,240,0.9); z-index: 18999;">
  ${menuItems ? html`<div class="${styles.menu}">${menuItems.map((menuItem, index) => html`
    <div class="${styles.menuItem}" style="margin-right: ${(parseFloat(diameter) / 2) - (parseFloat(menuItem.diameter) / 2)}px;">
      <div class="${styles.menuItemLabel}" style="opacity: ${menuOpen ? '1' : '0'}; transition-delay: ${(0.1 * (index + 1)).toPrecision(2)}s;">${menuItem.text}</div>
      <button class="${styles.menuItemButton}" onclick=${e => menuItem.action(e)} style="right: ${menuOpen ? '0' : '-90'}px; transition-delay: ${(0.1 * (index + 1)).toPrecision(2)}s; width: ${menuItem.diameter}; height: ${menuItem.diameter}; background-color: ${menuItem.colour};">${menuItem.icon}</button>
    </div>
  `)}</div>` : ''}
  </div>
  <button class="${styles.fab}" onclick=${e => action(e)} 
  ${disabled ? 'disabled' : ''}
  style="width: ${diameter}; height: ${diameter};background-color: ${colour};bottom: ${on ? '15px' : `-${parseInt(diameter) + 10}px`}; ${icon ? 'padding-top: 2px' : ''};">${icon || text}</button>
</div>
`
