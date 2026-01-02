import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { createGlassCard } from 'kwami/ui'

type Targets = {
  title: HTMLElement | null
  headerRight: HTMLElement | null
  body: HTMLElement | null
  footer: HTMLElement | null
}

export function KwamiGlassCard(props: {
  className?: string
  scrollContent?: boolean
  cursorGlow?: boolean
  title?: React.ReactNode
  headerRight?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
}) {
  const [targets, setTargets] = useState<Targets>({
    title: null,
    headerRight: null,
    body: null,
    footer: null,
  })

  const mountId = useMemo(() => `kwami-glass-card-mount-${Math.random().toString(16).slice(2)}`, [])

  useEffect(() => {
    const mount = document.getElementById(mountId)
    if (!mount) return

    mount.innerHTML = ''

    const card = createGlassCard({
      className: props.className,
      scrollContent: props.scrollContent ?? true,
      cursorGlow: props.cursorGlow ?? true,
    })

    // Ensure header/footer exist so portals have a stable target.
    card.header.style.display = ''
    card.footer.style.display = ''

    mount.appendChild(card.element)

    setTargets({
      title: card.element.querySelector('.kwami-glass-card__title') as HTMLElement | null,
      headerRight: card.element.querySelector('.kwami-glass-card__headerRight') as HTMLElement | null,
      body: card.body,
      footer: card.footer,
    })

    return () => {
      card.element.remove()
      setTargets({ title: null, headerRight: null, body: null, footer: null })
    }
  }, [mountId, props.className, props.cursorGlow, props.scrollContent])

  return (
    <>
      <div id={mountId} className="contents" />
      {targets.title && props.title ? createPortal(props.title, targets.title) : null}
      {targets.headerRight && props.headerRight ? createPortal(props.headerRight, targets.headerRight) : null}
      {targets.body && props.children ? createPortal(props.children, targets.body) : null}
      {targets.footer && props.footer ? createPortal(props.footer, targets.footer) : null}
    </>
  )
}





