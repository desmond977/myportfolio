import Hero from './components/hero/Hero.jsx'
import Section from './components/Section.jsx'
import ProjectsGrid from './components/projects/ProjectsGrid.jsx'
import Contact from './components/contact/Contact.jsx'

function App() {
  return (
    <div className="app">
      <Hero />

      <main className="main">
        <Section
          id="about"
          eyebrow="About"
          title="Full stack Web Developer. & Digital Marketer."
          bg={{
            aColor: 'rgba(167, 139, 250, 0.14)',
            aX: '78%',
            aY: '-12%',
            aXMobile: '62%',
            aYMobile: '-6%',
            bColor: 'rgba(34, 211, 238, 0.06)',
            bX: '14%',
            bY: '8%',
            bXMobile: '18%',
            bYMobile: '16%',
            opacity: 1,
            opacityMobile: 0.95,
          }}
        >
          <div className="aboutGrid">
            <p className="lead">
              I’m Azubuike Desmond — I’m a results-driven Digital Marketer 
              and Web Developer with hands-on experience
              in building and executing successful online strategies.  
                Over the years, I’ve worked with businesses across different 
              industries, helping them grow their online presence, attract the right audience,
               and convert traffic into real customers.
              </p>
              <p className="lead">
              My strength lies in combining technical development skills with marketing strategy, 
              allowing me to not just build websites, but build platforms that actually perform. 
              I specialize in paid ads, social media campaigns, and 
              custom website development tailored to business goals.
            </p>
            <div className="aboutCards">
              <div className="glassCard">
                <div className="kicker">Web Developer</div>
                <div className="value">Full Stack | Php | Laravel </div>
                <div className="hint">Custom, responsive websites built with modern technologies
                   like Laravel, React, and Custom Wordpress </div>
              </div>
              <div className="glassCard">
                <div className="kicker">Digital Marketer</div>
                <div className="value">Meta Ads / Google Ads</div>
                <div className="hint">Strategic campaigns designed to increase visibility, 
                  engagement, and conversions across multiple medias.</div>
              </div>
              <div className="glassCard">
                <div className="kicker">Social Media Management</div>
                <div className="value">Tiktok, Facebook, Instagram, Youtube </div>
                <div className="hint">Content creation, scheduling, and growth strategies
                   that help brands stay relevant and engaging. </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="projects"
          eyebrow="Selected work"
          title="Projects"
          bg={{
            aColor: 'rgba(34, 211, 238, 0.12)',
            aX: '82%',
            aY: '-10%',
            aXMobile: '64%',
            aYMobile: '-6%',
            bColor: 'rgba(167, 139, 250, 0.06)',
            bX: '18%',
            bY: '14%',
            bXMobile: '20%',
            bYMobile: '20%',
            opacity: 1,
            opacityMobile: 0.95,
          }}
        >
          <ProjectsGrid />
        </Section>

        <Section
          id="contact"
          eyebrow="Contact"
          title="Let’s build something that Gets Result."
          bg={{
            aColor: 'rgba(167, 139, 250, 0.10)',
            aX: '70%',
            aY: '-6%',
            aXMobile: '58%',
            aYMobile: '-4%',
            bColor: 'rgba(34, 211, 238, 0.10)',
            bX: '28%',
            bY: '12%',
            bXMobile: '28%',
            bYMobile: '18%',
            opacity: 1,
            opacityMobile: 0.95,
          }}
        >
          <Contact />
        </Section>
      </main>

      <footer className="footer">
        <div className="container footerInner">
          <div className="footerBrand">Azubuike Desmond</div>
          <div className="footerMeta">
            <span className="muted">© {new Date().getFullYear()}</span>
            <span className="dot" aria-hidden="true" />
            <a className="link" href="#top">
              Back to top
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
