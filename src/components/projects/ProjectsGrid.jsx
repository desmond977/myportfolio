import { useEffect, useMemo, useRef, useState } from 'react'
import { projects } from '../../content/projects.js'

function ProjectCard({ project, index }) {
  return (
    <a
      className="projectCard"
      href={project.href}
      data-reveal
      data-project-card
      data-index={index}
    >
      <div className={`projectMedia media-${project.accent}`} aria-hidden="true">
        {project.image ? (
          <img
            className="projectPhoto"
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : null}
        <div className="mediaGlow" />
      </div>
      <div className="projectMeta">
        <div className="projectTop">
          <div className="projectTitle">{project.title}</div>
          <span className="chip">Featured</span>
        </div>
        <div className="projectDesc">{project.desc}</div>
        <div className="projectTags">
          {project.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}

export default function ProjectsGrid() {
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  }, [])

  const items = projects.slice(0, 6)
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  const scrollToIndex = (idx) => {
    const track = trackRef.current
    if (!track) return

    const cards = track.querySelectorAll('[data-project-card]')
    const clamped = Math.max(0, Math.min(idx, cards.length - 1))
    const target = cards[clamped]
    if (!target) return

    const left = target.offsetLeft - 2
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const cards = [...track.querySelectorAll('[data-project-card]')]
    if (!cards.length) return

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]

        if (!visible?.target) return
        const idx = Number(visible.target.getAttribute('data-index') || '0')
        setActive(Number.isFinite(idx) ? idx : 0)
      },
      { root: track, threshold: [0.25, 0.5, 0.75] },
    )

    cards.forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const track = trackRef.current
    if (!track) return

    let paused = false
    const onPointerDown = () => {
      paused = true
    }
    track.addEventListener('pointerdown', onPointerDown, { passive: true })

    const id = window.setInterval(() => {
      if (paused) return
      setActive((v) => {
        const next = (v + 1) % items.length
        scrollToIndex(next)
        return next
      })
    }, 5200)

    return () => {
      track.removeEventListener('pointerdown', onPointerDown)
      window.clearInterval(id)
    }
  }, [items.length, reduceMotion])

  return (
    <div className="projectsSlider" data-reveal>
      <div className="projectsSliderTop">
        <div className="projectsSliderHint">Swipe / scroll</div>
        <div className="projectsSliderControls">
          <button
            type="button"
            className="projectsNavBtn"
            aria-label="Previous project"
            onClick={() => scrollToIndex(active - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="projectsNavBtn"
            aria-label="Next project"
            onClick={() => scrollToIndex(active + 1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="projectsTrack" ref={trackRef} aria-label="Projects slider">
        {items.map((p, idx) => (
          <ProjectCard key={p.title} project={p} index={idx} />
        ))}
      </div>

      <div className="projectsDots" aria-label="Project pages">
        {items.map((p, idx) => (
          <button
            key={p.title}
            type="button"
            className={`projectsDot ${idx === active ? 'isActive' : ''}`}
            aria-label={`Go to ${p.title}`}
            aria-current={idx === active ? 'true' : 'false'}
            onClick={() => scrollToIndex(idx)}
          />
        ))}
      </div>
    </div>
  )
}

