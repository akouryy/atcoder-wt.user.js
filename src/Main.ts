import { parseTen } from './Ten'
import { handleSubmissionPage } from './pages/submission'
import { addShortestLinks } from './shortest'
import { addDirectSubmissionTabs } from './units/navTabs'

export const IIFE = <T>(f: () => T): T => f()

/**
*
* @param {HTMLElement} f
* @param {CSSStyleDeclaration} obj
* @returns {void}
*/
const addStyles = (f: HTMLElement, obj: Partial<CSSStyleDeclaration>): void => {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  Object.entries(obj).forEach(([k, v]) => { (f.style as any)[k] = v })
}

if (window.location.href.includes('/tasks/')) {
  IIFE(() => {
    const mainArea = document.createElement('div')
    mainArea.classList.add('akouryy-main_area')
    addStyles(mainArea, {
      bottom: '0em',
      display: 'flex',
      left: '10vh',
      opacity: '0.9',
      position: 'fixed',
      right: '11vh',
      zIndex: '10000',
    })
    document.body.appendChild(mainArea)

    const memo = document.createElement('textarea')
    // memo.cols = 120
    memo.rows = 5
    addStyles(memo, {
      backgroundColor: '#fffcf6',
      flexGrow: '1',
      fontFamily: 'Menlo,Monaco,Consolas,"Courier New",monospace',
    })
    mainArea.appendChild(memo)

    const menu1 = document.createElement('div')
    mainArea.appendChild(menu1)

    const copyButton = document.createElement('button')
    function copy(): void {
      memo.select()
      document.execCommand('copy')

      copyButton.style.backgroundColor = '#99ff99'
      setTimeout(() => {
        copyButton.style.backgroundColor = '#aaddff'
      }, 1000)
    }

    {
      const tenButton = document.createElement('button')
      tenButton.innerText = 'TEN'
      addStyles(tenButton, {
        backgroundColor: '#aaddff',
        display: 'block',
      })
      const f = (): void => {
        memo.value = parseTen(memo.value)
        tenButton.style.backgroundColor = '#99ff99'
        setTimeout(() => {
          tenButton.style.backgroundColor = '#aaddff'
        }, 1000)
        copy()
      }
      tenButton.addEventListener('click', f)
      menu1.appendChild(tenButton)

      memo.addEventListener('keypress', (ev) => {
        if (ev.altKey && ev.code === 'KeyC') {
          ev.preventDefault()
          f()
        }
      })
    }

    {
      const sampleButton = document.createElement('button')
      sampleButton.innerText = 'samples'
      addStyles(sampleButton, {
        backgroundColor: '#ff9999',
        display: 'block',
      })

      sampleButton.addEventListener('click', () => {
        const samples = [...document.querySelectorAll('[id^=pre-sample]')].map((x: Element) => x.innerHTML)

        memo.value = samples.join('----------acwtc.separator----------\n')

        sampleButton.style.backgroundColor = '#99ff99'
        setTimeout(() => {
          sampleButton.style.backgroundColor = '#ff9999'
        }, 1000)
        copy()
      })
      menu1.appendChild(sampleButton)
    }

    copyButton.innerText = 'copy'
    addStyles(copyButton, {
      backgroundColor: '#aaddff',
      display: 'block',
    })
    copyButton.addEventListener('click', copy)
    menu1.appendChild(copyButton)
  })
}

handleSubmissionPage()
addShortestLinks()
addDirectSubmissionTabs()

IIFE(() => {
  const sel = document.querySelector<HTMLInputElement>("[name='data.LanguageId']")

  Array<[string, number]>(
    ['Awk', 4009],
    ['Bash', 4007], ['Clang++', 4004], ['dc', 4019],
    ['Perl', 4042], ['Raku6', 4043], ['Ruby', 4049],
    ['Sed', 4066],
  ).forEach(([name, id]) => {
    const btn = document.createElement('button')
    btn.innerText = name
    btn.onclick = () => {
      if (sel) { sel.value = `${id}` }
    }
    btn.type = 'button'
    sel?.parentNode?.appendChild(btn)
  })
})
