import { useMemo, useState } from 'react'

function encodeMailto({ to, subject, body }) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`
}

export default function Contact() {
  const [status, setStatus] = useState('idle')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const mailto = useMemo(() => {
    const body = [
      `Name: ${form.name || '-'}`,
      `Email: ${form.email || '-'}`,
      '',
      form.message || '',
    ].join('\n')
    return encodeMailto({
      to: 'Azubuikedesmond97@gmail.com',
      subject: 'Project inquiry',
      body,
    })
  }, [form])

  return (
    <div className="contactGrid">
      <div className="contactLeft" data-reveal>
        <p className="lead">
          Tell me what you’re building, your timeline, and the feeling you want
          the experience to evoke.
        </p>
        <div className="contactList">
          <a className="contactLink" href="tel:+2348104889570">
            08104889570
          </a>
          <a className="contactLink" href={mailto}>
            Azubuikedesmond97@gmail.com
          </a>
          <div className="muted">Remote-first · Worldwide</div>
          <div className="contactSocial">
            <a className="link" href="#" aria-label="GitHub">
              GitHub
            </a>
            <a className="link" href="#" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a className="link" href="#" aria-label="X">
              X
            </a>
          </div>
        </div>
      </div>

      <form
        className="contactForm glassCard"
        data-reveal
        onSubmit={(e) => {
          e.preventDefault()
          setStatus('opening')
          window.location.href = mailto
          window.setTimeout(() => setStatus('idle'), 800)
        }}
      >
        <div className="contactFormInner">
          <div className="formRow">
            <label className="label">
              Name
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
              />
            </label>
            <label className="label">
              Email
              <input
                className="input"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@domain.com"
                autoComplete="email"
                inputMode="email"
              />
            </label>
          </div>
          <label className="label">
            Message
            <textarea
              className="input textarea"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="What are you building?"
              rows={5}
            />
          </label>

          <div className="formActions">
            <button className="btn btnPrimary" type="submit">
              {status === 'opening' ? 'Opening email…' : 'Send message'}
            </button>
            <a className="btn btnGhost" href={mailto}>
              Copy email draft
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

