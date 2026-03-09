// GLSL shader modules for Vite/bundler
declare module '*.glsl?raw' {
  const shader: string
  export default shader
}

declare module '*.glsl' {
  const shader: string
  export default shader
}

// Image/texture modules
declare module '*.jpeg' {
  const url: string
  export default url
}

declare module '*.jpg' {
  const url: string
  export default url
}

declare module '*.png' {
  const url: string
  export default url
}
