import { useState } from 'react'

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  company: '',
}

const initialStatus = {
  type: 'idle',
  message: '',
}

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState(initialStatus)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    setStatus({ type: 'loading', message: 'Sending your message...' })

    try {
      const response = await fetch('/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Your message could not be sent right now.')
      }

      setForm(initialForm)
      setStatus({
        type: 'success',
        message: data.message || 'Message sent. I will get back to you shortly.',
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong while sending your message.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contactGrid">
      <div>
        <p className="lead">
          Tell me what you’re building, your timeline, and the feeling you want the experience to evoke.
        </p>

        <div className="contactList">
          <a className="contactLink" href="mailto:hello@azubuikedesmond.com">
            hello@azubuikedesmond.com
          </a>
          <a className="contactLink" href="mailto:azubuikedesmond97@gmail.com" target="_blank" rel="noreferrer">
            azubuikedesmond97@gmail.com
          </a>
          <a className="PhoneNumber" href="tel:08104889570" target="_blank" rel="noreferrer">
            08104889570
          </a>
        </div>
      </div>

      <div className="glassCard contactForm">
        <form className="contactFormInner" onSubmit={handleSubmit}>
          <div className="formRow">
            <label className="label">
              Name
              <input
                className="input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>

            <label className="label">
              Email
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>
          </div>

          <label className="label">
            Subject
            <input
              className="input"
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </label>

          <label className="label">
            Message
            <textarea
              className="input textarea"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="6"
              required
            />
          </label>

          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            autoComplete="off"
            tabIndex="-1"
            aria-hidden="true"
            className="srOnlyInput"
          />

          <div className={`formStatus ${status.type !== 'idle' ? `is${status.type[0].toUpperCase()}${status.type.slice(1)}` : ''}`}>
            {status.message}
          </div>

          <div className="formActions">
            <button className="btn btnPrimary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
