export function addDirectSubmissionTabs(): void {
  const urlMatch = /\/contests\/(?!archive\b)([\w-]+)(?=\/|$)/.exec(window.location.href)

  if (urlMatch) {
    const tabs = document.querySelector('#contest-nav-tabs > ul.nav-tabs')

    if (tabs) {
      const genHTML = (text: string, urlPostfix = ''): string => (
        `<a href='${urlMatch[0]}/submissions/${urlPostfix}'>` +
        `<span class="glyphicon glyphicon-list" aria-hidden="true"></span> ${text}</a>`
      )

      const post = tabs.childNodes[10]

      const allSubmissions = document.createElement('li')
      allSubmissions.innerHTML = genHTML('全')
      tabs.insertBefore(allSubmissions, post)

      const mySubmissions = document.createElement('li')
      mySubmissions.innerHTML = genHTML('自', 'me')
      tabs.insertBefore(mySubmissions, post)
    }
  }
}
