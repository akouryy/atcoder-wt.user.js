import { times, until } from './util'

function addLinksToContainer(
  urlMatch: RegExpMatchArray, shortestLinks: HTMLSpanElement,
  tasksBase: NodeListOf<HTMLOptionElement> | number[],
): void {
  let tasks: Array<{ id: string, shortTitle: string, title: string }>

  if (Array.isArray(tasksBase)) {
    const taskIDPrefix = urlMatch[1].replace(/-/g, '_')

    tasks = tasksBase.map((i) => {
      const innerID = String.fromCodePoint('a'.codePointAt(0)! + i)
      const title = `${innerID.toUpperCase()}問題`
      return {
        id: `${taskIDPrefix}_${innerID}`,
        shortTitle: title,
        title,
      }
    })
  } else {
    tasks = [...tasksBase].map((option) => ({
      id: option.value,
      shortTitle: option.innerText.substring(0, 10),
      title: option.innerText,
    }))
  }

  const { protocol, host } = window.location

  tasks.forEach((task) => {
    [false, true].forEach((all) => {
      const link = document.createElement('a')
      link.href =
          `${protocol}//${host}${urlMatch[0]}/submissions` +
          `?f.Status=${all ? '' : 'AC'}&f.Task=${task.id}&orderBy=source_length`
      link.innerText = all ? '[ALL]' : task.shortTitle
      link.title = task.title
      link.style.backgroundColor = all ? '#ddeeff' : '#eeffdd'
      link.style.color = 'inherit'
      link.style.margin = '0.1em'

      shortestLinks.appendChild(link)
    })
  })
}

export function addShortestLinks(): void {
  const urlMatch = /\/contests\/(?!archive\b)([\w-]+)(?=\/|$)/.exec(window.location.href)

  if (urlMatch) {
    const options = document.querySelectorAll<HTMLOptionElement>('#select-task > option[value]')
    const dest = document.querySelector('h2, span.h2, h3')

    if (dest) {
      const shortestContainer = document.createElement('span')
      shortestContainer.style.fontWeight = 'normal'
      shortestContainer.style.fontSize = '1.3rem'
      dest.appendChild(shortestContainer)
      shortestContainer.textContent = '最短: '
      const shortestLinks = document.createElement('span')
      shortestContainer.appendChild(shortestLinks)

      if (options.length > 0) {
        addLinksToContainer(urlMatch, shortestLinks, options)
      } else {
        addLinksToContainer(urlMatch, shortestLinks, times(8))
        let addCount = 1

        const addButton = document.createElement('button')
        addButton.innerText = '+'
        addButton.addEventListener('click', () => {
          addLinksToContainer(urlMatch, shortestLinks, until(addCount * 8, (addCount + 1) * 8))
          addCount += 1
        })
        shortestContainer.appendChild(addButton)
      }
    }
  }
}
