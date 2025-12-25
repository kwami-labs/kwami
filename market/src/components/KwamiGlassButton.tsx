import { useEffect, useMemo, useRef } from 'react'
import { createGlassButton } from 'kwami/ui'

export function KwamiGlassButton(props: {
  label: string
  mode?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  block?: boolean
  onClick?: (event: MouseEvent) => void
}) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const handleRef = useRef<ReturnType<typeof createGlassButton> | null>(null)
  const key = useMemo(() => `${props.mode ?? 'primary'}:${props.size ?? 'md'}:${props.block ? '1' : '0'}`, [props.block, props.mode, props.size])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    mount.innerHTML = ''
    handleRef.current?.element?.remove()

    const handle = createGlassButton({
      label: props.label,
      mode: props.mode ?? 'primary',
      size: props.size ?? 'md',
      disabled: !!props.disabled,
      onClick: (e) => props.onClick?.(e),
    })

    if (props.block) handle.element.style.width = '100%'

    handleRef.current = handle
    mount.appendChild(handle.element)

    return () => {
      handleRef.current?.element?.remove()
      handleRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    handleRef.current?.setLabel(props.label)
    handleRef.current?.setDisabled(!!props.disabled)
  }, [props.disabled, props.label])

  return <div ref={mountRef} className={['inline-flex', props.block ? 'w-full' : ''].filter(Boolean).join(' ')} />
}




