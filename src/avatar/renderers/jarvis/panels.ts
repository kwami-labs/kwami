import * as THREE from 'three'
import { markerVertexShader, panelFragmentShader } from './shaders.js'
import { BODY, BODY_DIM, BODY_FAINT, HOT, MONO_FONT, TEXT_FONT, formatUptime, setFont } from './labels.js'
import type { LabelLayout } from './layout.js'
import type { JarvisStatus } from './types.js'

/**
 * Holographic data panels floating around the reactor.
 *
 * Each panel is a canvas shown as an additive mask (same channel convention as the labels:
 * red is body text, green is highlighted text), framed by the shader. The panels are real
 * planes in the HUD's space — angled toward the viewer like the wings of a cockpit and set at
 * different depths — so tilting the interface slides them against the rings behind.
 *
 * Nothing here is decoration: every panel shows something that is actually happening (the
 * voice spectrum, the event log, the pointer, the clock), and a panel redraws only when the
 * string that describes its content changes.
 */

export type JarvisPanelId = 'spectrum' | 'waveform' | 'systems' | 'log' | 'tracking' | 'chrono'

export interface PanelPlacement {
  id: JarvisPanelId
  x: number
  y: number
  z: number
  width: number
  height: number
  /** Rotation about the vertical axis; positive turns a left-hand panel toward the centre. */
  yaw: number
  /** Rotation about the horizontal axis; positive leans the top edge toward the viewer. */
  pitch: number
  opacity: number
  bootDelay: number
}

const CANVAS_WIDTH = 768
const PAD = 38
const HEADER_RULE_Y = 66

/**
 * Where the panels sit. `wide` flanks the reactor with two columns that leave the title and
 * telemetry blocks, their leader lines and the two bright data streams clear. `stacked`
 * (portrait) only has room above and below, and only on tall screens.
 */
export function getPanelPlacements(layout: LabelLayout, halfHeight: number): PanelPlacement[] {
  if (layout === 'wide') {
    const yaw = 0.42
    return [
      { id: 'chrono', x: -2.24, y: 1.2, z: -0.22, width: 1.0, height: 0.38, yaw, pitch: 0.16, opacity: 0.8, bootDelay: 1.5 },
      { id: 'log', x: -2.26, y: -0.36, z: 0.34, width: 1.06, height: 0.62, yaw, pitch: 0, opacity: 1, bootDelay: 1.35 },
      { id: 'tracking', x: -2.24, y: -1.3, z: -0.22, width: 1.0, height: 0.36, yaw, pitch: -0.16, opacity: 0.8, bootDelay: 1.65 },
      { id: 'systems', x: 2.24, y: 1.27, z: -0.22, width: 1.0, height: 0.42, yaw: -yaw, pitch: 0.16, opacity: 0.8, bootDelay: 1.55 },
      { id: 'spectrum', x: 2.26, y: 0.36, z: 0.34, width: 1.06, height: 0.62, yaw: -yaw, pitch: 0, opacity: 1, bootDelay: 1.4 },
      { id: 'waveform', x: 2.24, y: -1.24, z: -0.22, width: 1.0, height: 0.4, yaw: -yaw, pitch: -0.16, opacity: 0.8, bootDelay: 1.7 },
    ]
  }
  if (halfHeight < 3.05) return []
  return [
    { id: 'spectrum', x: 0, y: 2.62, z: 0.2, width: 1.5, height: 0.56, yaw: 0, pitch: 0.2, opacity: 0.95, bootDelay: 1.4 },
    { id: 'log', x: 0, y: -2.68, z: 0.2, width: 1.5, height: 0.56, yaw: 0, pitch: -0.2, opacity: 0.95, bootDelay: 1.5 },
  ]
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

export class HudPanel {
  readonly id: JarvisPanelId
  readonly mesh: THREE.Mesh
  readonly material: THREE.ShaderMaterial
  /** 0–1, eased. */
  hover = 0
  /** 0–1, eased. */
  focus = 0
  /** Decaying highlight, set to 1 when the panel receives new content worth noticing. */
  flash = 0
  private placement: PanelPlacement
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private readonly texture: THREE.CanvasTexture
  private readonly seed: number
  private lastKey = ''

  constructor(
    placement: PanelPlacement,
    uniforms: {
      uColor: THREE.Uniform<THREE.Color>
      uHot: THREE.Uniform<THREE.Color>
      uTime: THREE.Uniform<number>
    },
  ) {
    this.id = placement.id
    this.placement = placement
    this.seed = (placement.x * 0.37 + placement.y * 0.61 + 7) % 1
    this.canvas = document.createElement('canvas')
    const context = this.canvas.getContext('2d')
    if (!context) throw new Error('2D canvas unavailable for Jarvis panels')
    this.context = context

    this.texture = new THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = THREE.NoColorSpace
    this.texture.minFilter = THREE.LinearMipmapLinearFilter
    this.texture.magFilter = THREE.LinearFilter
    this.texture.anisotropy = 4

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uMap: new THREE.Uniform(this.texture),
        uColor: uniforms.uColor,
        uHot: uniforms.uHot,
        uTime: uniforms.uTime,
        uOpacity: new THREE.Uniform(0),
        uAspect: new THREE.Uniform(placement.width / placement.height),
        uHover: new THREE.Uniform(0),
        uFlash: new THREE.Uniform(0),
        uReveal: new THREE.Uniform(0),
        uSeed: new THREE.Uniform(this.seed),
      },
      vertexShader: markerVertexShader,
      fragmentShader: panelFragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      premultipliedAlpha: true,
    })

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material)
    this.mesh.renderOrder = 6
    this.applyPlacement(placement)
  }

  applyPlacement(placement: PanelPlacement): void {
    this.placement = placement
    this.material.uniforms.uAspect!.value = placement.width / placement.height
    const height = Math.round((CANVAS_WIDTH * placement.height) / placement.width)
    if (this.canvas.width !== CANVAS_WIDTH || this.canvas.height !== height) {
      this.canvas.width = CANVAS_WIDTH
      this.canvas.height = height
      // three.js cannot resize an uploaded texture in place.
      this.texture.dispose()
      this.lastKey = ''
    }
  }

  invalidate(): void {
    this.lastKey = ''
  }

  /** Redraw only when `key` differs from the previous draw. */
  draw(key: string, paint: (context: CanvasRenderingContext2D, width: number, height: number) => void): void {
    if (key === this.lastKey) return
    this.lastKey = key
    const { width, height } = this.canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.fillStyle = '#000'
    this.context.fillRect(0, 0, width, height)
    paint(this.context, width, height)
    this.texture.needsUpdate = true
  }

  /**
   * Ease the panel toward its pose. A hovered panel lifts toward the viewer; a focused one
   * comes forward, squares up to the camera and grows, while the others (`dimmed`) step back.
   */
  update(
    dt: number,
    pose: { hovered: boolean; focused: boolean; dimmed: boolean; depth: number; time: number; gain: number },
  ): void {
    this.hover = damp(this.hover, pose.hovered ? 1 : 0, 10, dt)
    this.focus = damp(this.focus, pose.focused ? 1 : 0, 7, dt)
    this.flash *= Math.exp(-dt * 2.6)

    const p = this.placement
    // Focus pulls the panel toward the centre as it comes forward: perspective magnifies it on
    // the way, and without the pull an outer panel would leave the screen.
    const pull = this.focus * 0.22
    const lift = this.hover * 0.14 + this.focus * 0.5
    const bob = Math.sin(pose.time * 0.6 + this.seed * 6.28) * 0.012
    this.mesh.position.set(p.x * (1 - pull), p.y * (1 - pull) + bob, p.z * pose.depth + lift)
    const scale = 1 + this.hover * 0.05 + this.focus * 0.25
    this.mesh.scale.set(p.width * scale, p.height * scale, 1)
    const square = 1 - this.focus * 0.75
    this.mesh.rotation.set(
      p.pitch * square * Math.min(1, pose.depth) + Math.sin(pose.time * 0.4 + this.seed * 3) * 0.012,
      p.yaw * square * Math.min(1, pose.depth),
      0,
    )

    const reveal = Math.max(0, Math.min(1, (pose.time - p.bootDelay) / 0.7))
    const uniforms = this.material.uniforms
    uniforms.uReveal!.value = 1 - Math.pow(1 - reveal, 3)
    uniforms.uHover!.value = Math.min(1, this.hover + this.focus * 0.7)
    uniforms.uFlash!.value = this.flash
    const dim = pose.dimmed ? 0.4 : 1
    const current = uniforms.uOpacity!.value as number
    uniforms.uOpacity!.value = damp(current, p.opacity * dim * pose.gain * (reveal > 0 ? 1 : 0), 8, dt)
  }

  dispose(): void {
    this.texture.dispose()
    this.material.dispose()
    this.mesh.geometry.dispose()
  }
}

// ---------------------------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------------------------

/** Title, a short code on the right, and a rule with a hot tick. Returns the content top. */
function drawHeader(context: CanvasRenderingContext2D, width: number, title: string, code: string, hotCode = false): number {
  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  setFont(context, 600, 30, TEXT_FONT, 6)
  context.fillStyle = BODY
  context.fillText(title, PAD, 52)
  context.textAlign = 'right'
  setFont(context, 500, 22, MONO_FONT, 2)
  context.fillStyle = hotCode ? HOT : BODY_DIM
  context.fillText(code, width - PAD, 50)
  context.fillStyle = BODY_FAINT
  context.fillRect(PAD, HEADER_RULE_Y, width - PAD * 2, 2)
  context.fillStyle = HOT
  context.fillRect(PAD, HEADER_RULE_Y - 3, 44, 8)
  return HEADER_RULE_Y + 18
}

export interface SpectrumContent {
  /** 0–1 per bar. */
  bars: ArrayLike<number>
  /** 0–1 peak-hold per bar. */
  peaks: ArrayLike<number>
  db: number
  hz: number
  active: boolean
}

export function spectrumKey(content: SpectrumContent): string {
  let key = content.active ? `${Math.round(content.db)}|${Math.round(content.hz / 4)}|` : 'x|'
  for (let index = 0; index < content.bars.length; index++) {
    key += Math.round((content.bars[index] ?? 0) * 24).toString(36)
    key += Math.round((content.peaks[index] ?? 0) * 24).toString(36)
  }
  return key
}

export function drawSpectrumPanel(context: CanvasRenderingContext2D, width: number, height: number, content: SpectrumContent): void {
  const code = content.active ? `${content.db.toFixed(1)} dB` : 'NO SIGNAL'
  const top = drawHeader(context, width, 'VOICE SPECTRUM', code, content.active) + 6
  const bottom = height - 58
  const left = PAD
  const right = width - PAD
  const count = content.bars.length
  const gap = 5
  const barWidth = (right - left - gap * (count - 1)) / count

  // Level guides.
  context.fillStyle = BODY_FAINT
  for (const level of [0.25, 0.5, 0.75, 1]) {
    context.fillRect(left, Math.round(bottom - (bottom - top) * level), right - left, 1)
  }

  for (let index = 0; index < count; index++) {
    const value = Math.max(0.02, Math.min(1, content.bars[index] ?? 0))
    const x = left + index * (barWidth + gap)
    const barHeight = (bottom - top) * value
    context.fillStyle = value > 0.72 ? HOT : BODY
    context.fillRect(x, bottom - barHeight, barWidth, barHeight)
    const peak = Math.min(1, content.peaks[index] ?? 0)
    if (peak > value + 0.02) {
      context.fillStyle = HOT
      context.fillRect(x, bottom - (bottom - top) * peak - 3, barWidth, 3)
    }
  }

  context.fillStyle = BODY_DIM
  context.fillRect(left, bottom + 4, right - left, 2)
  setFont(context, 500, 20, MONO_FONT, 2)
  context.textAlign = 'left'
  context.fillText('LF', left, height - 24)
  context.textAlign = 'right'
  context.fillText('HF', right, height - 24)
  context.textAlign = 'center'
  context.fillStyle = content.active && content.hz > 0 ? BODY : BODY_DIM
  context.fillText(content.active && content.hz > 0 ? `PEAK ${Math.round(content.hz)} Hz` : 'PEAK ---- Hz', width / 2, height - 24)
}

export interface WaveformContent {
  /** 0–1 per band; the trace is synthesised from the strongest ones. */
  spectrum: ArrayLike<number>
  level: number
  time: number
  active: boolean
}

export function drawWaveformPanel(context: CanvasRenderingContext2D, width: number, height: number, content: WaveformContent): void {
  const top = drawHeader(context, width, 'WAVEFORM', content.active ? 'LIVE' : 'IDLE', content.active)
  const bottom = height - 30
  const middle = (top + bottom) / 2
  const amplitude = (bottom - top) / 2
  const left = PAD
  const right = width - PAD

  // Graticule.
  context.fillStyle = BODY_FAINT
  context.fillRect(left, Math.round(middle), right - left, 1)
  for (let division = 0; division <= 8; division++) {
    const x = Math.round(left + ((right - left) * division) / 8)
    context.fillRect(x, middle - (division % 4 === 0 ? 14 : 7), 1, division % 4 === 0 ? 28 : 14)
  }

  // Six partials, weighted by the bands they stand for. An oscilloscope shows the signal, and
  // the analyser only gives magnitudes — so the phases are ours, the envelope is the voice's.
  const partials: Array<[number, number]> = []
  const bands = content.spectrum.length
  for (let partial = 0; partial < 6; partial++) {
    const from = Math.floor((partial / 6) * bands)
    const to = Math.floor(((partial + 1) / 6) * bands)
    let peak = 0
    for (let band = from; band < to; band++) peak = Math.max(peak, content.spectrum[band] ?? 0)
    partials.push([peak, 1.5 + partial * 2.1])
  }
  const gain = content.active ? 0.3 + content.level * 0.7 : 0.015
  context.beginPath()
  const steps = 160
  for (let step = 0; step <= steps; step++) {
    const u = step / steps
    let y = 0
    for (let index = 0; index < partials.length; index++) {
      const [weight, frequency] = partials[index]!
      y += weight * Math.sin(u * frequency * Math.PI * 2 + content.time * (3 + index * 1.7) + index)
    }
    // Hann window so the trace meets the graticule at both ends.
    const window = 0.5 - 0.5 * Math.cos(u * Math.PI * 2)
    const py = middle - Math.max(-1, Math.min(1, (y / 2.4) * gain * window)) * amplitude
    const px = left + (right - left) * u
    if (step === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  }
  context.lineWidth = 3
  context.lineJoin = 'round'
  context.strokeStyle = content.active && content.level > 0.45 ? HOT : BODY
  context.stroke()
}

export function drawSystemsPanel(context: CanvasRenderingContext2D, width: number, height: number, rows: JarvisStatus[]): void {
  const top = drawHeader(context, width, 'SYSTEMS', `${rows.filter((row) => row.hot).length}/${rows.length} ACTIVE`)
  const available = height - top - 18
  const capacity = Math.max(1, Math.floor(available / 46))
  const shown = rows.slice(0, capacity)
  const rowHeight = available / Math.max(shown.length, 1)
  shown.forEach((row, index) => {
    const y = top + rowHeight * (index + 0.5) + 10
    context.fillStyle = row.hot ? HOT : BODY_DIM
    context.fillRect(PAD, y - 20, 12, 12)
    context.textAlign = 'left'
    setFont(context, 500, 26, MONO_FONT, 3)
    context.fillStyle = BODY_DIM
    context.fillText(row.label, PAD + 28, y - 8)
    context.textAlign = 'right'
    setFont(context, 600, 28, MONO_FONT, 2)
    context.fillStyle = row.hot ? HOT : BODY
    context.fillText(row.value, width - PAD, y - 8)
  })
}

export interface LogLine {
  id: number
  /** Wall-clock stamp, already formatted. */
  stamp: string
  text: string
  /** Renderer time the line was added, for the typing reveal. */
  bornAt: number
}

/** Characters of the newest line revealed so far. */
export function logReveal(line: LogLine | undefined, now: number): number {
  if (!line) return 0
  return Math.min(line.text.length, Math.floor((now - line.bornAt) * 70))
}

export function drawLogPanel(context: CanvasRenderingContext2D, width: number, height: number, lines: LogLine[], now: number): void {
  const top = drawHeader(context, width, 'EVENT LOG', `${String(lines.length ? lines[lines.length - 1]!.id : 0).padStart(4, '0')}`)
  const lineHeight = 42
  const capacity = Math.max(1, Math.floor((height - top - 14) / lineHeight))
  const shown = lines.slice(-capacity)
  const newest = shown[shown.length - 1]
  shown.forEach((line, index) => {
    const y = top + lineHeight * (index + 1) - 12
    const isNewest = line === newest
    context.textAlign = 'left'
    setFont(context, 500, 22, MONO_FONT, 1)
    context.fillStyle = BODY_FAINT
    context.fillText(line.stamp, PAD, y)
    setFont(context, isNewest ? 600 : 500, 25, MONO_FONT, 1)
    context.fillStyle = isNewest ? HOT : index >= shown.length - 3 ? BODY : BODY_DIM
    let text = line.text
    if (isNewest) {
      const revealed = logReveal(line, now)
      text = line.text.slice(0, revealed) + (revealed < line.text.length ? '█' : '')
    }
    context.fillText(fitText(context, text, width - PAD * 2 - 132), PAD + 132, y)
  })
  if (shown.length === 0) {
    setFont(context, 500, 24, MONO_FONT, 2)
    context.fillStyle = BODY_DIM
    context.textAlign = 'left'
    context.fillText('AWAITING EVENTS', PAD, top + 34)
  }
}

/** Trim `text` with an ellipsis so it fits `maxWidth` in the current font. */
function fitText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (context.measureText(text).width <= maxWidth) return text
  let trimmed = text
  while (trimmed.length > 1 && context.measureText(`${trimmed}…`).width > maxWidth) {
    trimmed = trimmed.slice(0, -1)
  }
  return `${trimmed}…`
}

export interface TrackingContent {
  /** Pointer on the HUD plane, in reactor units. */
  x: number
  y: number
  active: boolean
  /** Radians. */
  yaw: number
  pitch: number
  zoom: number
}

export function trackingKey(content: TrackingContent): string {
  const q = (value: number, step: number): number => Math.round(value / step)
  return `${content.active ? `${q(content.x, 0.02)}|${q(content.y, 0.02)}` : 'x'}|${q(content.yaw, 0.01)}|${q(content.pitch, 0.01)}|${q(content.zoom, 0.01)}`
}

function signed(value: number, digits: number): string {
  return `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(digits)}`
}

export function drawTrackingPanel(context: CanvasRenderingContext2D, width: number, height: number, content: TrackingContent): void {
  const top = drawHeader(context, width, 'TRACKING', content.active ? 'TARGET LOCK' : 'NO TARGET', content.active)
  const size = height - top - 22
  const cx = PAD + size / 2
  const cy = top + size / 2

  // Scope: the whole HUD reduced to a square, the pointer a blip on it.
  context.strokeStyle = BODY_DIM
  context.lineWidth = 2
  context.strokeRect(PAD, top, size, size)
  context.fillStyle = BODY_FAINT
  context.fillRect(PAD, Math.round(cy), size, 1)
  context.fillRect(Math.round(cx), top, 1, size)
  context.beginPath()
  context.arc(cx, cy, size * 0.3, 0, Math.PI * 2)
  context.strokeStyle = BODY_FAINT
  context.stroke()
  if (content.active) {
    const range = 3
    const bx = cx + (Math.max(-range, Math.min(range, content.x)) / range) * (size / 2 - 6)
    const by = cy - (Math.max(-range, Math.min(range, content.y)) / range) * (size / 2 - 6)
    context.fillStyle = HOT
    context.fillRect(bx - 5, by - 5, 10, 10)
    context.fillStyle = BODY
    context.fillRect(bx - 16, Math.round(by), 32, 1)
    context.fillRect(Math.round(bx), by - 16, 1, 32)
  }

  const columnLeft = PAD + size + 34
  const rows: Array<[string, string]> = [
    ['POS', content.active ? `${signed(content.x, 2)} ${signed(content.y, 2)}` : '--.-- --.--'],
    ['ATT', `${signed((content.yaw * 180) / Math.PI, 0)}° ${signed((content.pitch * 180) / Math.PI, 0)}°`],
    ['ZOOM', `${content.zoom.toFixed(2)}x`],
  ]
  const rowHeight = size / rows.length
  rows.forEach(([label, value], index) => {
    const y = top + rowHeight * (index + 0.5) + 9
    context.textAlign = 'left'
    setFont(context, 500, 24, MONO_FONT, 3)
    context.fillStyle = BODY_DIM
    context.fillText(label, columnLeft, y)
    context.textAlign = 'right'
    setFont(context, 600, 27, MONO_FONT, 1)
    context.fillStyle = index === 0 && content.active ? HOT : BODY
    context.fillText(value, width - PAD, y)
  })
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export function formatStamp(date: Date): string {
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map((value) => String(value).padStart(2, '0')).join(':')
}

export function drawChronoPanel(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  now: Date,
  sessionSeconds: number,
): void {
  const date = `${WEEKDAYS[now.getDay()]} ${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const top = drawHeader(context, width, 'CHRONO', date)
  const baseline = top + (height - top) * 0.62
  context.textAlign = 'left'
  setFont(context, 600, 92, MONO_FONT, 4)
  context.fillStyle = HOT
  context.fillText(formatStamp(now), PAD, baseline)
  context.textAlign = 'right'
  setFont(context, 500, 22, MONO_FONT, 3)
  context.fillStyle = BODY_DIM
  context.fillText('SESSION', width - PAD, baseline - 42)
  setFont(context, 600, 30, MONO_FONT, 2)
  context.fillStyle = BODY
  context.fillText(formatUptime(sessionSeconds), width - PAD, baseline)
}
