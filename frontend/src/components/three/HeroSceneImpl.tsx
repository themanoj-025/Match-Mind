// @ts-nocheck
import React, { useRef, useEffect, useCallback } from 'react'

export default function HeroSceneImpl() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let renderer: any, scene: any, camera: any, particles: any, animationId: number | undefined
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const init = async () => {
      const THREE = await import('three')

      const container = containerRef.current
      if (!container) return

      const width = container.offsetWidth
      const height = container.offsetHeight

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      scene = new THREE.Scene()

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      camera.position.z = 15

      const count = 200
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const sizes = new Float32Array(count)
      const speeds = new Float32Array(count)

      const colorPalette = [
        new THREE.Color('#00E676'),
        new THREE.Color('#00BFA5'),
        new THREE.Color('#FFB300'),
        new THREE.Color('#4FC3F7'),
        new THREE.Color('#CE93D8'),
        new THREE.Color('#FF3D57'),
        new THREE.Color('#2ECC40'),
        new THREE.Color('#FF851B'),
      ]

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 6 + Math.random() * 6

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        positions[i * 3 + 2] = r * Math.cos(phi)

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
        colors[i * 3] = color.r
        colors[i * 3 + 1] = color.g
        colors[i * 3 + 2] = color.b

        sizes[i] = 0.04 + Math.random() * 0.08
        speeds[i] = 0.2 + Math.random() * 0.4
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

      const material = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      particles.userData = { speeds: Array.from(speeds) }

      let time = 0
      const animate = () => {
        animationId = requestAnimationFrame(animate)
        time += 0.005

        if (!isReduced) {
          particles.rotation.y = time * 0.1
          particles.rotation.x = Math.sin(time * 0.05) * 0.1

          const mx = (mouseRef.current.x / width) * 2 - 1
          const my = -(mouseRef.current.y / height) * 2 + 1
          particles.rotation.y += mx * 0.01
          particles.rotation.x += my * 0.01

          const pos = geometry.attributes.position.array
          for (let i = 0; i < count; i++) {
            if (!particles.userData.origY) particles.userData.origY = new Float32Array(pos)
            const origY = particles.userData.origY[i * 3 + 1]
            pos[i * 3 + 1] = origY + Math.sin(time * speeds[i] + i) * 0.3
          }
          geometry.attributes.position.needsUpdate = true
        }

        renderer.render(scene, camera)
      }

      animate()

      const handleResize = () => {
        const w = container.offsetWidth
        const h = container.offsetHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', handleResize)
    }

    init()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (renderer) {
        renderer.dispose()
        if (containerRef.current?.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) obj.material.dispose()
        })
      }
      window.removeEventListener('resize', () => {})
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      onMouseMove={handleMouseMove}
      aria-hidden="true"
    />
  )
}

