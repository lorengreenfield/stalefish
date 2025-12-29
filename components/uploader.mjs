import { html, css, fieldIsTouched } from 'halfcab'
import uploadIcon from './icons/upload.mjs'

// Known extension groups used to infer acceptance from MIME major types during dragover
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.gif', '.bmp', '.tif', '.tiff', '.png', '.svg'])
const VIDEO_EXTS = new Set(['.mxf', '.mkv', '.webm', '.mov', '.wmv', '.mp4', '.3gp', '.avi', '.mpg', '.mpeg', '.flv', '.asx', '.asf', '.divx', '.rm', '.m1v', '.m2v', '.m4v'])
const PDF_EXTS = new Set(['.pdf'])

const styles = css`
    .uploader {
        margin: 0 10px 0 20px !important;
        position: absolute;
        right: 4px;
        top: 16.5px;
    }

    .placeholder {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 auto;
        min-width: 0;
        display: block;
        /* Leave room for the upload icon and the clear button (approx +40px) */
        padding-right: 84px;
    }

    .value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 auto;
        min-width: 0;
        display: block;
        /* Leave room for the upload icon and the clear button (approx +40px) */
        padding-right: 84px;
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

    .dragOver {}
    .dragAccept {}
    .dragReject {}

    .frame.dragOver {
        /* neutral: no visual change on generic drag over */
    }

    .frame.dragAccept {
        border-color: #6edf74;
    }

    .frame.dragReject {
        border-color: #ef6c00;
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

// Utility available across this module to clear all uploader drag classes
function clearAllUploaderFrames () {
  try {
    const frames = document.querySelectorAll(`.${styles.frame}`)
    frames.forEach(f => {
      f.classList.remove(styles.dragOver, styles.dragAccept, styles.dragReject)
    })
  } catch {}
}
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

  // --- Global drag-and-drop awareness across the window ---
  // When a file is dragged anywhere in the window, all uploader frames
  // evaluate compatibility and show a green border if acceptable. Individual
  // frames only show orange when hovered if the type is not compatible.
  //
  // We set up window-level listeners once per module load and then, on
  // dragover/enter, iterate all current frames in the DOM.

  // Lazily installed global listeners
  if (typeof window !== 'undefined' && !window.__sfUploaderGlobalDnD) {
    window.__sfUploaderGlobalDnD = true

    const parseAcceptListGlobal = (acceptStr) => {
      if (!acceptStr) return null
      return acceptStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    }

    // Return tri-state for acceptance during dragover based on DataTransfer contents:
    // 'accept' | 'reject' | 'unknown'
    const dataTransferMatchState = (dt, listArg) => {
      const list = listArg
      if (!dt) return 'unknown'
      const items = dt.items || []
      const hasRules = !!(list && list.length)
      const hasExtRule = hasRules && list.some(r => r.startsWith('.'))
      // const hasNonExtRule = hasRules && list.some(r => !r.startsWith('.'))
      // Pre-compute coarse categories from extension-only rules to allow
      // best-effort inference using MIME major types during dragover.
      const acceptImageByExt = hasExtRule && list.some(r => IMAGE_EXTS.has(r))
      const acceptVideoByExt = hasExtRule && list.some(r => VIDEO_EXTS.has(r))
      const acceptPdfByExt = hasExtRule && list.some(r => PDF_EXTS.has(r))
      let sawFile = false
      let unknown = false
      // Prefer files if provided during dragover (Firefox may expose names/types here)
      if (dt.files && dt.files.length > 0) {
        for (let i = 0; i < dt.files.length; i++) {
          const f = dt.files[i]
          if (!f) continue
          sawFile = true
          if (hasRules) {
            const name = (f.name || '').toLowerCase()
            const type = (f.type || '').toLowerCase()
            const ok = list.some(rule => {
              if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
              if (rule.startsWith('.')) return name.endsWith(rule)
              return type === rule
            })
            if (!ok) return 'reject'
          }
        }
        return sawFile ? (hasRules ? 'accept' : 'accept') : 'unknown'
      }

      // Fall back to items which may have limited info (no filenames)
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (it.kind !== 'file') continue
        sawFile = true
        if (!hasRules) continue // any file is ok
        const type = (it.type || '').toLowerCase()
        if (type) {
          const matchesType = list.some(rule => {
            if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
            if (rule.startsWith('.')) return false // cannot decide by extension from type alone
            return type === rule
          })
          let inferredByCategory = false
          if (!matchesType && hasExtRule) {
            if (type.startsWith('image/') && acceptImageByExt) inferredByCategory = true
            else if (type.startsWith('video/') && acceptVideoByExt) inferredByCategory = true
            else if (type === 'application/pdf' && acceptPdfByExt) inferredByCategory = true
          }
          if (matchesType || inferredByCategory) {
            // ok for this item by non-extension rules; continue
          } else {
            // If there are extension rules, we cannot be sure; otherwise it's a reject
            if (hasExtRule) {
              unknown = true
            } else {
              return 'reject'
            }
          }
        } else {
          // No type available; undecidable when rules exist
          unknown = true
        }
      }
      if (!sawFile) return 'unknown'
      if (hasRules && unknown) return 'unknown'
      return 'accept'
    }

    // Use shared helper to clear drag classes on all uploader frames

    const markFramesOnDrag = (e) => {
      try {
        const frames = document.querySelectorAll(`.${styles.frame}`)
        frames.forEach(f => {
          if (f.getAttribute('data-disabled') === 'true') return
          const acceptStr = (f.getAttribute('data-accept') || '').toLowerCase()
          const list = parseAcceptListGlobal(acceptStr)
          const state = dataTransferMatchState(e.dataTransfer, list)
          // Global step: show green on compatible, neutral otherwise; never show reject globally
          f.classList.add(styles.dragOver)
          f.classList.remove(styles.dragReject)
          if (state === 'accept') {
            f.classList.add(styles.dragAccept)
          } else {
            f.classList.remove(styles.dragAccept)
          }
        })
      } catch {}
    }

    window.addEventListener('dragenter', (e) => {
      markFramesOnDrag(e)
    })
    window.addEventListener('dragover', (e) => {
      // keep default prevented to indicate copy-drop in some browsers
      try { e.preventDefault() } catch {}
      markFramesOnDrag(e)
    })
    window.addEventListener('dragleave', (e) => {
      // If leaving the window (relatedTarget null), clear all
      if (!e.relatedTarget) clearAllUploaderFrames()
    })
    window.addEventListener('drop', () => {
      clearAllUploaderFrames()
    })
    window.addEventListener('dragend', () => {
      clearAllUploaderFrames()
    })
  }

  // Helpers for drag & drop behavior
  const parseAcceptList = (acceptStr) => {
    if (!acceptStr) return null
    return acceptStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
  }

  const acceptList = parseAcceptList(accept)

  const fileMatches = (file) => {
    if (!acceptList || acceptList.length === 0) return true
    const name = (file && file.name ? file.name : '').toLowerCase()
    const type = (file && file.type ? file.type : '').toLowerCase()
    return acceptList.some(rule => {
      if (!rule) return false
      if (rule.endsWith('/*')) {
        // image/*, video/*, etc.
        const prefix = rule.slice(0, -1) // keep the slash
        return type.startsWith(prefix)
      }
      if (rule.startsWith('.')) {
        // .png, .jpg, etc.
        return name.endsWith(rule)
      }
      // exact mime type
      return type === rule
    })
  }

  // Local tri-state acceptance for hover feedback: 'accept' | 'reject' | 'unknown'
  const dataTransferAccepts = (dt) => {
    if (!dt) return 'unknown'
    const items = dt.items || []
    const hasRules = !!(acceptList && acceptList.length)
    const hasExtRule = hasRules && acceptList.some(r => r.startsWith('.'))
    const acceptImageByExt = hasExtRule && acceptList.some(r => r.startsWith('.') && IMAGE_EXTS.has(r))
    const acceptVideoByExt = hasExtRule && acceptList.some(r => r.startsWith('.') && VIDEO_EXTS.has(r))
    const acceptPdfByExt = hasExtRule && acceptList.some(r => r.startsWith('.') && PDF_EXTS.has(r))
    let sawFile = false

    // Prefer files when available during dragover
    if (dt.files && dt.files.length > 0) {
      for (let i = 0; i < dt.files.length; i++) {
        const f = dt.files[i]
        if (!f) continue
        sawFile = true
        if (hasRules && !fileMatches(f)) return 'reject'
      }
      return sawFile ? (hasRules ? 'accept' : 'accept') : 'unknown'
    }

    // Fallback to items with limited info
    let unknown = false
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      if (it.kind !== 'file') continue
      sawFile = true
      if (!hasRules) continue
      const type = (it.type || '').toLowerCase()
      if (type) {
        const matchesType = acceptList.some(rule => {
          if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
          if (rule.startsWith('.')) return false
          return type === rule
        })
        let inferredAccept = false
        if (!matchesType && hasExtRule) {
          if (type.startsWith('image/') && acceptImageByExt) inferredAccept = true
          else if (type.startsWith('video/') && acceptVideoByExt) inferredAccept = true
          else if (type === 'application/pdf' && acceptPdfByExt) inferredAccept = true
        }
        if (matchesType || inferredAccept) {
          // ok for this item
        } else {
          // Try to infer definite rejection by category mismatch
          if (hasExtRule) {
            if (type.startsWith('image/') && !acceptImageByExt) return 'reject'
            if (type.startsWith('video/') && !acceptVideoByExt) return 'reject'
            if (type === 'application/pdf' && !acceptPdfByExt) return 'reject'
            unknown = true
          } else {
            return 'reject'
          }
        }
      } else {
        unknown = true
      }
    }
    if (!sawFile) return 'unknown'
    return unknown ? 'unknown' : 'accept'
  }

  const addDragClass = (frameEl, cls) => {
    if (!frameEl) return
    const over = styles.dragOver
    const acceptCls = styles.dragAccept
    const rejectCls = styles.dragReject
    frameEl.classList.add(over)
    frameEl.classList.remove(acceptCls, rejectCls)
    if (cls) frameEl.classList.add(cls)
  }

  const clearDragClasses = (frameEl) => {
    if (!frameEl) return
    frameEl.classList.remove(styles.dragOver, styles.dragAccept, styles.dragReject)
  }

  const onDragOver = (e) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    const frame = e.currentTarget
    const state = dataTransferAccepts(e.dataTransfer)
    // Local rule: only show reject when definitively not acceptable on hover
    if (state === 'reject') {
      frame.classList.add(styles.dragOver)
      frame.classList.add(styles.dragReject)
    }
  }

  const onDragEnter = (e) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    const frame = e.currentTarget
    const state = dataTransferAccepts(e.dataTransfer)
    // Local rule: only show reject when definitively not acceptable on hover
    if (state === 'reject') {
      frame.classList.add(styles.dragOver)
      frame.classList.add(styles.dragReject)
    }
  }

  const onDragLeave = (e) => {
    if (disabled) return
    // Only clear if actually leaving the frame, not moving between children
    const frame = e.currentTarget
    const related = e.relatedTarget
    if (!related || !frame.contains(related)) {
      // Remove local reject indicators; global will maintain accept state
      frame.classList.remove(styles.dragReject)
    }
  }

  const onDrop = (e) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    // Clear all global highlights so every frame returns to neutral on drop
    clearAllUploaderFrames()
    const frame = e.currentTarget
    const input = frame.querySelector('input[type="file"]')
    const files = e.dataTransfer && e.dataTransfer.files
    let ok = true
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        if (!fileMatches(files[i])) { ok = false; break }
      }
    } else {
      ok = false
    }
    if (ok && input) {
      // Best effort to expose dropped files to consumers
      let assigned = false
      try {
        Object.defineProperty(input, 'files', { value: files, writable: false, configurable: true })
        assigned = true
      } catch (err) {
        // read-only in most browsers; use a side-channel
        try { input._droppedFiles = files } catch (e2) {}
      }
      clearDragClasses(frame)
      if (typeof onchange === 'function') {
        // Provide multiple ways for consumers to access files
        const syntheticEvent = {
          type: 'change',
          isDrop: true,
          target: input,
          currentTarget: input,
          files,
          assignedToInput: assigned
        }
        onchange(syntheticEvent)
      }
    } else {
      addDragClass(frame, styles.dragReject)
      setTimeout(() => clearDragClasses(frame), 180)
    }
  }

  // Wrap input change to enforce accept-based validation for normal selections (not just drag/drop)
  const handleInputChange = (e) => {
    try {
      const input = e && e.currentTarget
      const frame = input && (input.closest ? input.closest(`.${styles.frame}`) : input.parentElement)
      const files = input && input.files
      // If no accept rules, pass through
      if (!acceptList || acceptList.length === 0) {
        if (typeof onchange === 'function') onchange(e)
        return
      }

      let ok = true
      if (files && files.length) {
        for (let i = 0; i < files.length; i++) {
          if (!fileMatches(files[i])) { ok = false; break }
        }
      } else {
        // No files selected (cancel) — allow through to consumer if desired
        ok = true
      }

      if (ok) {
        if (typeof onchange === 'function') onchange(e)
      } else {
        // Visual feedback similar to invalid drop
        if (frame) {
          addDragClass(frame, styles.dragReject)
          setTimeout(() => clearDragClasses(frame), 180)
        }
        // Clear the selection so no invalid value sticks
        try { input.value = '' } catch {}
      }
    } catch (err) {
      // On unexpected errors, fall back to default handler to avoid blocking
      if (typeof onchange === 'function') onchange(e)
    }
  }

  // Normalize accept list for both native input filtering and our own logic
  const acceptAttr = (typeof accept === 'string' && accept)
    ? accept.split(',').map(s => s.trim()).filter(Boolean).join(',')
    : ''

  // Note: set accept as a literal attribute to ensure the browser sees it
  const uploaderEl = html`<input data-gramm="false" ?disabled=${disabled} style="${disabled ? 'cursor: not-allowed;' : ''}" class="${styles.uploader} ${fieldIsTouched(holdingPen, property) === true ? styles.touched : ''}" onchange=${handleInputChange} type="file" ?required=${required} accept=${acceptAttr} hidden />`

  // Show a transient "Opening files..." message while the native file dialog is opening
  const showOpeningWhileChoosing = (inputEl) => {
    try {
      if (!inputEl || disabled) return
      const frame = inputEl.closest ? inputEl.closest(`.${styles.frame}`) : inputEl.parentElement
      if (!frame || frame.dataset.opening === '1') return
      const placeholderEl = frame.querySelector(`.${styles.placeholder}`)
      if (!placeholderEl) return // only show when placeholder is currently visible

      frame.dataset.opening = '1'
      if (!placeholderEl.dataset.originalText) placeholderEl.dataset.originalText = placeholderEl.textContent || ''
      placeholderEl.textContent = 'Opening files...'

      const clearOpening = () => {
        try {
          delete frame.dataset.opening
          if (placeholderEl && placeholderEl.dataset && typeof placeholderEl.dataset.originalText === 'string') {
            placeholderEl.textContent = placeholderEl.dataset.originalText
          }
        } catch {}
        window.removeEventListener('focus', onWindowFocus, true)
      }

      const onWindowFocus = () => {
        // When the file dialog closes (open or cancel), window regains focus
        // Use a micro delay to ensure order after possible change event
        setTimeout(clearOpening, 0)
      }

      // Clear once a file is selected or dialog is dismissed
      inputEl.addEventListener('change', clearOpening, { once: true })
      window.addEventListener('focus', onWindowFocus, true)
    } catch {}
  }

  const wrapperClassName = wrapperStyle
    ? (typeof wrapperStyle === 'string' ? wrapperStyle : (wrapperStyle && wrapperStyle.toString ? wrapperStyle.toString() : ''))
    : ''

  return html`
      <div class="${wrapperClassName}" style="display: inline-block; width: 100%; margin-top: 36px;">
          <label style="width: 100%; text-align: left; position: relative; padding: 0; cursor: pointer;">
              ${label ? html`<span class="${styles.label}" style="opacity: ${holdingPen[property] === 0 || holdingPen[property] || (permanentTopPlaceholder || permanentTopLabel) ? 1 : 0};">${label}${required ? ' *' : ''}</span>` : ''}
              <span class="${styles.frame}" data-accept="${acceptAttr || ''}" data-disabled="${!!disabled}" ondragenter=${onDragEnter} ondragover=${onDragOver} ondragleave=${onDragLeave} ondrop=${onDrop} onmousedown=${(e) => {
                  if (disabled) return
                  try {
                      const frame = e.currentTarget
                      const input = frame && frame.querySelector('input[type="file"]')
                      showOpeningWhileChoosing(input)
                  } catch {}
              }}>
          ${!holdingPen[property]
                  ? html`<span class="${styles.placeholder}">${placeholder}${required ? ' *' : ''}</span>`
                  : !imagePreview
                          ? html`<span class="${styles.value}">${textPreview || holdingPen[property]}</span>`
                          : '\u00A0'}
          ${uploaderEl}
          <span style="opacity: 0.6; margin-left: -12px; width: ${progress}%; position: absolute; background-color: #EEE; height: 100%;"></span>
        </span>
              ${imagePreview ? html`<img src="${imagePreview}" style="position: absolute; height: 35px; top: -9px; left: 20px; z-index: 30;"/>` : ''}
              ${!disableClear
                      ? html`
                          <div
                                  class="${styles.clear}"
                                  role="button"
                                  tabindex="0"
                                  onclick=${(e) => {
                                      // Prevent the label's default behavior of triggering the hidden file input
                                      e.preventDefault()
                                      e.stopPropagation()
                                      // Only clear when there is a value; otherwise do nothing
                                      if (holdingPen && Object.prototype.hasOwnProperty.call(holdingPen, property) && holdingPen[property]) {
                                          if (typeof onclear === 'function') onclear(e)
                                      }
                                  }}
                                  onkeydown=${(e) => {
                                      // Also handle keyboard activation without triggering the file chooser
                                      if (e.key === 'Enter' || e.key === ' ') {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          if (holdingPen && Object.prototype.hasOwnProperty.call(holdingPen, property) && holdingPen[property]) {
                                              if (typeof onclear === 'function') onclear(e)
                                          }
                                      }
                                  }}
                                  aria-disabled=${!holdingPen || !holdingPen[property]}
                          >
                              clear
                          </div>
                      `
                      : ''}
              <div class="${styles.icon}">${uploadIcon({ colour: '#ccc', width: 28, height: 28 })}</div>
          </label>
      </div>
  `
}
