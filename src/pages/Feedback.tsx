import { Link } from 'react-router-dom';
import { Bug, HelpCircle, Lightbulb, Map, MessageSquarePlus } from 'lucide-react';

const issueBase = 'https://github.com/mbaffour/lifexp/issues/new/choose';

export function Feedback() {
  return (
    <main className="feedback-page">
      <nav className="landing-nav">
        <Link to="/" className="brand-block public"><span className="brand-mark">XP</span><span><strong>LifeXP</strong><small>Track your life. Level it up.</small></span></Link>
        <Link className="btn ghost" to="/app">Launch LifeXP</Link>
      </nav>
      <section className="panel feedback-hero">
        <h1>Feedback</h1>
        <p>LifeXP is a GitHub Pages app with no backend, so feedback opens GitHub Issues instead of posting a form.</p>
      </section>
      <section className="feedback-grid">
        <a className="feedback-card" href={issueBase} target="_blank" rel="noreferrer"><Bug /><h2>Report a bug</h2><p>Tell me what happened, what you expected, and how to reproduce it.</p></a>
        <a className="feedback-card" href={issueBase} target="_blank" rel="noreferrer"><Lightbulb /><h2>Request a feature</h2><p>Describe the life-tracking workflow you want LifeXP to support.</p></a>
        <a className="feedback-card" href={issueBase} target="_blank" rel="noreferrer"><HelpCircle /><h2>Ask a question</h2><p>Ask how something works or where a feature should live.</p></a>
        <a className="feedback-card" href={issueBase} target="_blank" rel="noreferrer"><Lightbulb /><h2>Suggest an improvement</h2><p>Share a UX, accessibility, dashboard, chart, or workflow refinement.</p></a>
        <a className="feedback-card" href="https://github.com/mbaffour/lifexp/issues" target="_blank" rel="noreferrer"><Map /><h2>View roadmap</h2><p>Browse known issues, future plans, and active discussion.</p></a>
      </section>
      <section className="panel">
        <h2>Good issue reports include</h2>
        <ul>
          <li>What happened and what you expected.</li>
          <li>Your browser and device.</li>
          <li>Screenshots if possible.</li>
          <li>Steps to reproduce the issue.</li>
          <li>No private exported data unless anonymized.</li>
        </ul>
        <a className="btn primary" href={issueBase} target="_blank" rel="noreferrer"><MessageSquarePlus size={16} /> Open GitHub Issues</a>
      </section>
    </main>
  );
}
