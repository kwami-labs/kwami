import { useEffect, useRef } from 'react'
import { createKwamiLogoSvg } from 'kwami/ui'

export function KwamiLogo(props: { className?: string }) {
  const hostRef = useRef<HTMLSpanElement | null>(null)
  const logoRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    host.innerHTML = ''

    const logoEl = createKwamiLogoSvg({
      gradientId: `kwami-logo-grad-${Math.random().toString(16).slice(2)}`,
      strokeWidth: 4,
      style: {
        height: '26px',
        width: '140px',
      },
    })

    logoRef.current = logoEl
    host.appendChild(logoEl)

    if (props.className) {
      logoEl.classList.add(...props.className.split(/\s+/g).filter(Boolean))
    }

    return () => {
      logoRef.current?.remove()
      logoRef.current = null
    }
  }, [props.className])

  return <span ref={hostRef} className="inline-flex items-center" />
}




