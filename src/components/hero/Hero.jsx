import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const HeroScene = lazy(() => import('./HeroScene.jsx'))

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const rootRef = useRef(null)
  const overlayRef = useRef(null)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [isInView, setIsInView] = useState(true)

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  const scrollToSection = (id) => {
    const target = document.getElementById(id)
    if (!target) return

    const navOffset = window.innerWidth <= 980 ? 96 : 88
    const top = target.getBoundingClientRect().top + window.scrollY - navOffset

    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? 'auto' : 'smooth',
    })

    window.history.replaceState(null, '', `#${id}`)
  }

  useEffect(() => {
    if (reduceMotion) return

    const root = rootRef.current
    if (!root) return

    const updateVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }

    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)

    const io = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.15)
      },
      { threshold: [0, 0.15, 0.3] },
    )
    io.observe(root)

    return () => {
      document.removeEventListener('visibilitychange', updateVisibility)
      io.disconnect()
    }
  }, [reduceMotion])

  useEffect(() => {
    const root = rootRef.current
    const overlay = overlayRef.current
    if (!root || !overlay) return
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      gsap.ticker.lagSmoothing(1000, 16)
      ScrollTrigger.config({ ignoreMobileResize: true })

      gsap.fromTo(
        overlay.querySelectorAll('[data-hero-reveal]'),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power2.out', stagger: 0.065 },
      )

      gsap.to(overlay, {
        y: -26,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })

      gsap.to(root.querySelector('.heroVignette'), {
        autoAlpha: 0.6,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <header id="top" ref={rootRef} className="heroRoot">
      <div className="heroCanvas" aria-hidden="true">
        {!reduceMotion && isTabVisible && isInView ? (
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        ) : null}
      </div>

      <div className="heroVignette" aria-hidden="true" />

      <div className="heroOverlay" ref={overlayRef}>
        <div className="container">
          <div className="heroNav" data-hero-reveal>
            <div className="brand">
              <span className="brandMark" aria-hidden="true" />
              <span className="brandText">Azubuike Desmond</span>
            </div>
            <nav className="nav">
              <button className="navLink" type="button" onClick={() => scrollToSection('about')}>
                About
              </button>
              <button className="navLink" type="button" onClick={() => scrollToSection('projects')}>
                Projects
              </button>
              <button className="navLink" type="button" onClick={() => scrollToSection('contact')}>
                Contact
              </button>
            </nav>
          </div>

          <div className="heroGrid">
            <div className="heroContent">
              <div className="heroEyebrow" data-hero-reveal>
                Digital Experiences That Drive Results
              </div>
              <h1 className="heroTitle" data-hero-reveal>
                Web Developer,
                <br />
                Digital Marketer.
              </h1>
              <p className="heroSubtitle" data-hero-reveal>
                I&apos;m Azubuike Desmond. I help businesses increase visibility, generate
                leads, and boost conversions through social media marketing and
                high-performing websites.
              </p>
              <div className="heroActions" data-hero-reveal>
                <button className="btn btnPrimary" type="button" onClick={() => scrollToSection('projects')}>
                  View My Work
                </button>
                <button className="btn btnGhost" type="button" onClick={() => scrollToSection('contact')}>
                  Hire Me
                </button>
              </div>
            </div>

            <div className="heroPortrait" data-hero-reveal aria-hidden="true">
              <div className="heroPortraitFrame glassCard">
                <img
                  className="heroPortraitImg"
                  src="/portrait.png"
                  alt=""
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="heroPortraitGlow" />
            </div>
          </div>

          <div className="heroBottom" data-hero-reveal>
            <div className="scrollHint">
              <span className="scrollLine" aria-hidden="true" />
              <span className="muted">Scroll</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
