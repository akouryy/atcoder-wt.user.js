export function handleSubmissionsPage(): void {
  if (/\/submissions\/?($|\?)/.test(window.location.href)) {
    const options = document.querySelectorAll<HTMLOptionElement>('#select-task > option[value]')
    const dest = document.querySelector('h2')

    if (dest) {
      const linkContainer = document.createElement('span')
      linkContainer.style.fontWeight = 'normal'
      linkContainer.style.fontSize = '1.3rem'
      dest.appendChild(linkContainer)

      const { protocol, host, pathname } = window.location

      options.forEach((option) => {
        [false, true].forEach((all) => {
          const link = document.createElement('a')
          link.href =
            `${protocol}//${host}${pathname}` +
            `?f.Status=${all ? '' : 'AC'}&f.Task=${option.value}&orderBy=source_length`
          link.innerText = all ? '[ALL]' : option.innerText.substring(0, 10)
          link.title = option.innerText
          link.style.backgroundColor = all ? '#ddeeff' : '#eeffdd'
          link.style.color = 'inherit'
          link.style.margin = '0.1em'

          linkContainer.appendChild(link)
        })
      })
    }
  }
}
