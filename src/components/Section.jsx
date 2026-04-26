import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Section({ id, eyebrow, title, bg, children }) {
  const rootRef = useRef(null)
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-reveal]'),
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          ease: 'power2.out',
          stagger: 0.07,
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        },
      )

      if (bg) {
        const root = document.documentElement
        const isMobile = window.matchMedia?.('(max-width: 720px)')?.matches
        const aX = isMobile && bg.aXMobile ? bg.aXMobile : bg.aX
        const aY = isMobile && bg.aYMobile ? bg.aYMobile : bg.aY
        const bX = isMobile && bg.bXMobile ? bg.bXMobile : bg.bX
        const bY = isMobile && bg.bYMobile ? bg.bYMobile : bg.bY
        const opacity = isMobile && typeof bg.opacityMobile === 'number' ? bg.opacityMobile : bg.opacity

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        tl.set(root, {
          '--bgAColor': bg.aColor,
          '--bgAX': aX,
          '--bgAY': aY,
          '--bgBColor': bg.bColor,
          '--bgBX': bX,
          '--bgBY': bY,
          '--bgOverlayOpacity': 0,
        })

        // Fade in exactly at section start, hold, then fade out at section end.
        tl.to(root, { '--bgOverlayOpacity': opacity ?? 1, duration: 0.18, ease: 'none' })
        tl.to(root, { '--bgOverlayOpacity': opacity ?? 1, duration: 0.64, ease: 'none' })
        tl.to(root, { '--bgOverlayOpacity': 0, duration: 0.18, ease: 'none' })
      }
    }, el)

    return () => ctx.revert()
  }, [reduceMotion, bg])

  return (
    <section id={id} ref={rootRef} className="section">
      <div className="container">
        <div className="sectionHeader" data-reveal>
          {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
          {title ? <h2 className="sectionTitle">{title}</h2> : null}
        </div>
        <div className="sectionBody" data-reveal>
          {children}
        </div>
      </div>
    </section>
  )
}

