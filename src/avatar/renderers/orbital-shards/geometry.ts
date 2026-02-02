import {
  BufferGeometry,
  Float32BufferAttribute,
  OctahedronGeometry,
  TetrahedronGeometry,
  IcosahedronGeometry,
  SphereGeometry,
} from 'three'
import type { FormationConfig } from './types'

/**
 * Create a custom elongated prism geometry for crystal shards
 * This creates a distinctive asymmetric crystal shape
 */
export function createPrismGeometry(scale: number = 1): BufferGeometry {
  // Custom prism with 6 faces - elongated and asymmetric
  const h = 1.0 * scale // height
  const w = 0.3 * scale // width at base
  const d = 0.2 * scale // depth
  const t = 0.15 * scale // top offset for asymmetry

  // Vertices for asymmetric elongated prism
  const vertices = new Float32Array([
    // Base triangle (bottom)
    -w, -h * 0.5, d * 0.5,
    w, -h * 0.5, d * 0.5,
    0, -h * 0.5, -d,

    // Top point (offset for asymmetry)
    t * 0.5, h * 0.5, 0,

    // Additional points for faceting
    -w * 0.3, h * 0.2, d * 0.2,
    w * 0.3, h * 0.2, d * 0.2,
  ])

  // Faces (triangles)
  const indices = [
    // Bottom face
    0, 2, 1,
    // Front faces
    0, 1, 3,
    1, 4, 3,
    // Back faces  
    1, 2, 5,
    2, 3, 5,
    // Side faces
    2, 0, 3,
    0, 4, 3,
  ]

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Create an octahedron shard (double pyramid)
 */
export function createOctahedronShard(scale: number = 1): BufferGeometry {
  const geometry = new OctahedronGeometry(0.3 * scale, 0)
  // Stretch vertically for crystal-like appearance
  const positions = geometry.getAttribute('position')
  const arr = positions.array as Float32Array

  for (let i = 1; i < arr.length; i += 3) {
    arr[i] *= 1.8 // Elongate Y axis
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()

  return geometry
}

/**
 * Create a tetrahedron shard
 */
export function createTetrahedronShard(scale: number = 1): BufferGeometry {
  const geometry = new TetrahedronGeometry(0.35 * scale, 0)
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Create the inner core geometry (icosahedron for gem-like appearance)
 */
export function createCoreGeometry(size: number = 0.8): BufferGeometry {
  const geometry = new IcosahedronGeometry(size, 1)
  return geometry
}

/**
 * Create the outer glow sphere for the core
 */
export function createCoreGlowGeometry(size: number = 1.2): BufferGeometry {
  const geometry = new SphereGeometry(size, 32, 32)
  return geometry
}

/**
 * Get shard geometry based on formation config
 */
export function getShardGeometry(
  formation: FormationConfig,
  scale: number = 1,
): BufferGeometry {
  switch (formation.shardShape) {
    case 'prism':
      return createPrismGeometry(scale)
    case 'octahedron':
      return createOctahedronShard(scale)
    case 'tetrahedron':
      return createTetrahedronShard(scale)
    default:
      return createOctahedronShard(scale)
  }
}

/**
 * Create ambient particle positions for atmosphere
 */
export function createParticlePositions(
  count: number,
  radius: number = 5,
): Float32Array {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    // Spherical distribution
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = radius * (0.5 + Math.random() * 0.5)

    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)
  }

  return positions
}

/**
 * Generate orbital positions for shards based on formation pattern
 */
export function generateOrbitalPositions(
  count: number,
  radiusRange: [number, number],
  pattern: 'random' | 'spiral' | 'rings',
): Array<{ position: [number, number, number]; orbitSpeed: number; orbitPhase: number; tilt: number }> {
  const positions: Array<{
    position: [number, number, number]
    orbitSpeed: number
    orbitPhase: number
    tilt: number
  }> = []

  const [minRadius, maxRadius] = radiusRange

  for (let i = 0; i < count; i++) {
    const t = i / count

    let radius: number
    let theta: number
    let phi: number
    let orbitSpeed: number
    let tilt: number

    switch (pattern) {
      case 'spiral': {
        // Helical pattern - shards spiral around
        radius = minRadius + (maxRadius - minRadius) * t
        theta = t * Math.PI * 6 // Multiple rotations
        phi = Math.PI * 0.5 + (Math.random() - 0.5) * 0.3
        orbitSpeed = 0.5 + Math.random() * 0.3
        tilt = t * Math.PI * 2
        break
      }

      case 'rings': {
        // Concentric rings
        const ringIndex = Math.floor(t * 3) // 3 rings
        const ringProgress = (t * 3) % 1
        radius = minRadius + ((maxRadius - minRadius) / 3) * (ringIndex + 0.5)
        theta = ringProgress * Math.PI * 2
        phi = Math.PI * 0.5 + (ringIndex - 1) * 0.2 // Slight tilt per ring
        orbitSpeed = 0.3 + ringIndex * 0.15
        tilt = ringIndex * 0.5
        break
      }

      case 'random':
      default: {
        // Random constellation
        radius = minRadius + Math.random() * (maxRadius - minRadius)
        theta = Math.random() * Math.PI * 2
        phi = Math.acos(2 * Math.random() - 1)
        orbitSpeed = 0.2 + Math.random() * 0.6
        tilt = Math.random() * Math.PI
        break
      }
    }

    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)

    positions.push({
      position: [x, y, z],
      orbitSpeed,
      orbitPhase: theta,
      tilt,
    })
  }

  return positions
}
