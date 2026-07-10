import React, { useMemo, useEffect } from 'react'

const HeroScene = React.lazy(() => import('./HeroSceneImpl'))

interface HeroSceneWrapperProps {
  [key: string]: unknown
}

export default function HeroSceneWrapper(props: HeroSceneWrapperProps) {
  const [hasWebGL, setHasWebGL] = React.useState(true)
  const [isLoaded, setIsLoaded] = React.useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setHasWebGL(false)
    } catch {
      setHasWebGL(false)
    }
    setIsLoaded(true)
  }, [])

  if (!isLoaded) return null
  if (!hasWebGL) return <StaticFallback />
  return (
    <React.Suspense fallback={<StaticFallback />}>
      <HeroScene {...props} />
    </React.Suspense>
  )
}

function StaticFallback() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    })),
  [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[var(--mm-accent-green)]"
          style={{
            left: star.left,
            top: star.top,
            width: star.size + 'px',
            height: star.size + 'px',
            opacity: 0.15 + Math.random() * 0.2,
            animation: `glow-pulse ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

