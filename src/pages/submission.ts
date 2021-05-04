import { iSplice } from '../utli'

export function handleSubmissionPage(): void {
  if (/\/submissions\/\d+($|\?)/.test(window.location.href)) {
    let user = null as string | null

    document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="/contests/"][href*="/submissions?f.User="]',
    ).forEach((el) => {
      const m = /\/contests\/[\w-.]+\/submissions\?f\.User=([\w-.]+)$/.exec(el.href)
      if (m) {
        // eslint-disable-next-line prefer-destructuring
        user = m[1]
      }
    })

    if (user) {
      document.title = iSplice(
        document.title.split(''), 0, 3,
        ...user.slice(0, 3).split(''),
      ).join('')
    }
  }
}
