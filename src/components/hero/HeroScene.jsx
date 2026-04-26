import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles, useDetectGPU } from '@react-three/drei'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'

function Scene({ effectsEnabled, isMobile }) {
  const { camera, pointer, clock } = useThree()
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  useFrame(() => {
    const t = clock.elapsedTime

    // Very slow cinematic drift (independent of pointer)
    const driftX = Math.sin(t * 0.12) * 0.16
    const driftY = Math.cos(t * 0.10) * 0.10

    // Pointer parallax blended in (kept subtle and smoothed)
    const px = reduceMotion ? 0 : pointer.x * 0.35
    const py = reduceMotion ? 0 : pointer.y * 0.18

    const targetX = driftX + px
    const targetY = 0.15 + driftY + py

    camera.position.x += (targetX - camera.position.x) * 0.03
    camera.position.y += (targetY - camera.position.y) * 0.03
    camera.lookAt(0, 0.1, 0)
  })

  const sparkleCount = reduceMotion ? 90 : 140
  const fogColor = isMobile ? '#070812' : '#040407'

  return (
    <>
      <fog attach="fog" args={[fogColor, 5.5, 18]} />

      <Sparkles
        count={effectsEnabled ? sparkleCount : Math.min(70, sparkleCount)}
        speed={effectsEnabled ? (reduceMotion ? 0.07 : 0.12) : 0.06}
        opacity={isMobile ? 0.42 : 0.36}
        scale={[13, 7, 12]}
        size={isMobile ? 1.35 : 1.25}
        color="#fbfbff"
      />

      {effectsEnabled ? (
        <EffectComposer multisampling={0}>
          <DepthOfField
            focusDistance={0.02}
            focalLength={0.22}
            bokehScale={2.2}
            height={320}
          />
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.12}
            luminanceSmoothing={0.92}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.15} darkness={0.75} />
          <Noise opacity={0.03} />
        </EffectComposer>
      ) : null}
    </>
  )
}

export default function HeroScene() {
  const gpu = useDetectGPU()
  const [effectsEnabled, setEffectsEnabled] = useState(true)
  const [maxDpr, setMaxDpr] = useState(1.25)
  const [isMobile, setIsMobile] = useState(false)
  const requestedDprRef = useRef(1)

  useEffect(() => {
    // Conservative defaults; then upgrade only on stronger GPUs.
    const tier = typeof gpu?.tier === 'number' ? gpu.tier : 0
    const mobile = Boolean(gpu?.isMobile)
    setIsMobile(mobile)

    const enableEffects = !mobile && tier >= 3
    setEffectsEnabled(enableEffects)

    // DPR is the biggest lever for perf.
    if (mobile || tier <= 1) setMaxDpr(1)
    else if (tier === 2) setMaxDpr(1.1)
    else setMaxDpr(1.25)
  }, [gpu])

  // Resolve dpr as a number to avoid high DPR spikes.
  if (typeof window !== 'undefined') {
    requestedDprRef.current = Math.min(window.devicePixelRatio || 1, maxDpr)
  } else {
    requestedDprRef.current = 1
  }

  return (
    <Canvas
      dpr={requestedDprRef.current}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      camera={{ position: [0, 0.2, 6.2], fov: 46, near: 0.1, far: 50 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 0)
      }}
    >
      <Suspense fallback={null}>
        <Scene effectsEnabled={effectsEnabled} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  )
}

