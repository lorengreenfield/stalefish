import { html, css } from 'halfcab'

const width = 375

// language=CSS
const styles = css`
    .sideDrawer {
        transition: left 0.2s ease, opacity 0.4s ease;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20000;
        width: ${width}px;
        height: 100vh;
        background-color: rgba(0,0,0,0.9);
        color: white;
    }

    .closeButton {
        width: 20px;
        height: 20px;
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }

    .content {
        position: absolute;
        left: 0;
        top: 30px;
    }
`

export default ({ on, topPadding, closeIcon, closeAction, content }) => html`
    <div class="${styles.sideDrawer}"
         style="opacity: ${on ? 1 : 0};left: ${on ? '0px' : `calc(-1 * (${width}px + 10px))`};${topPadding ? `padding-top: ${topPadding}` : ''}">
        <div style="width: 100%; position: relative;">
            <div class="${styles.closeButton}"
                 onclick=${e => closeAction && closeAction(e)}>${closeIcon}
            </div>
            <div class="${styles.content}">
                ${content}
            </div>
        </div>
    </div>
`
