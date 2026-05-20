/* Minimal data-driven renderer for the GitHub-style profile theme
   This file expects a `PORTFOLIO` object. Edit values below. */

const PORTFOLIO = {
  name: 'YOUR NAME',
  avatar: 'https://placehold.co/512x512?text=Avatar',
  bio: 'Developer. Open-source enthusiast.',
  github: 'https://github.com/',
  linkedin: '',
  twitter: '',
  website: '',
  totalRepos: 12,
  followers: 42,
  contributions: 1234,

  aboutMarkdown: `# About\n\nThis is a short README-style section. Use **Markdown** to describe yourself, your goals, and what you're building.`,

  /* pinned projects */
  projects: [
    { name: 'Example Project', desc: 'Short description of project.', language: 'JavaScript', color: '#f1e05a', stars: 120, url: '#' },
    { name: 'TypeSafe UI', desc: 'Component library with strong types.', language: 'TypeScript', color: '#2b7489', stars: 84, url: '#' },
    { name: 'ML Helper', desc: 'Small Python utilities for data.', language: 'Python', color: '#3572A5', stars: 46, url: '#' },
    { name: 'Dev Tools', desc: 'CLI utilities and dev scripts.', language: 'Shell', color: '#89e051', stars: 12, url: '#' },
  ],

  /* contributions: an array of numbers, one per day. We'll render in a 7-row grid flowing by column (week columns).
     Provide as many days as you want; we will render in columns of 7 (days). */
  contributionsArray: new Array(7 * 12).fill(0).map(() => Math.floor(Math.random() * 6)),
};

/* helpers */
const el = (tag, cls = '', attrs = {}) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

const txt = (s) => document.createTextNode(String(s));

/* fill sidebar placeholders if present */
const fillSidebar = () => {
  document.querySelectorAll('[src],[alt],[href]').forEach((n) => {
    ['src','alt','href'].forEach((a) => {
      const val = n.getAttribute(a);
      if (!val) return;
      n.setAttribute(a, val.replace('{{AVATAR}}', PORTFOLIO.avatar)
        .replace('{{NAME}}', PORTFOLIO.name)
        .replace('{{GITHUB}}', PORTFOLIO.github)
        .replace('{{LINKEDIN}}', PORTFOLIO.linkedin)
        .replace('{{TWITTER}}', PORTFOLIO.twitter)
        .replace('{{WEBSITE}}', PORTFOLIO.website));
    });
  });

  document.body.querySelectorAll('.gp-name, .gp-bio').forEach((n) => {
    if (n.classList.contains('gp-name')) n.textContent = PORTFOLIO.name;
    if (n.classList.contains('gp-bio')) n.textContent = PORTFOLIO.bio;
  });

  document.querySelector('.gp-stats strong') && (document.querySelectorAll('.gp-stats strong')[0].textContent = PORTFOLIO.totalRepos);
  document.querySelectorAll('.gp-stats strong')[1] && (document.querySelectorAll('.gp-stats strong')[1].textContent = PORTFOLIO.followers);
  document.querySelectorAll('.gp-stats strong')[2] && (document.querySelectorAll('.gp-stats strong')[2].textContent = PORTFOLIO.contributions);
};

/* markdown -> very small renderer: supports #, ##, **bold**, links [text](url) and paragraphs */
const renderMarkdown = (md) => {
  // escape
  let html = md.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // headings
  html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // paragraphs
  html = html.split(/\n\n+/).map(block => `<p>${block.replace(/\n/g,'<br>')}</p>`).join('');
  return html;
};

const buildAbout = () => {
  const c = document.getElementById('about');
  if (!c) return;
  c.innerHTML = renderMarkdown(PORTFOLIO.aboutMarkdown);
};

const buildProjects = () => {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  // language color + emoji mappings
  const langColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Go': '#00ADD8',
    'Ruby': '#701516',
  };
  const langEmoji = {
    'JavaScript': '🟡',
    'TypeScript': '🔵',
    'Python': '🐍',
    'Shell': '🖥️',
  };

  PORTFOLIO.projects.forEach((p) => {
    const card = el('article','project-card');
    const h = el('h3'); h.textContent = p.name;
    const d = el('p','project-desc'); d.textContent = p.desc;
    const meta = el('div','project-meta');

    const color = p.color || langColors[p.language] || '#ccc';
    const emoji = langEmoji[p.language] || '';

    const lang = el('span','lang-dot'); lang.style.background = color;
    const langName = el('span'); langName.style.color = 'var(--muted)';
    langName.textContent = (emoji ? (emoji + ' ') : '') + (p.language || '');

    const stars = el('span','stars'); stars.textContent = `★ ${p.stars || 0}`;
    meta.appendChild(lang); meta.appendChild(langName); meta.appendChild(stars);

    if (p.url) {
      const a = el('a','project-link',{'href':p.url,'rel':'noopener noreferrer','target':'_blank'});
      a.textContent = 'View'; a.style.float = 'right';
      card.appendChild(a);
    }
    card.appendChild(h); card.appendChild(d); card.appendChild(meta);
    grid.appendChild(card);
  });
};

const buildHeatmap = () => {
  const grid = document.getElementById('contrib-grid');
  if (!grid) return;
  const arr = PORTFOLIO.contributionsArray || [];
  // compute color scale from 0..max
  const max = Math.max(...arr, 1);
  arr.forEach((v) => {
    const s = el('span');
    const pct = v / max;
    // interpolate between very light and dark greens
    if (v === 0) s.style.background = '#e6f4ea';
    else if (pct <= 0.25) s.style.background = '#9be9b3';
    else if (pct <= 0.5) s.style.background = '#40c463';
    else if (pct <= 0.8) s.style.background = '#30a14e';
    else s.style.background = '#216e39';
    s.title = `${v} contributions`;
    grid.appendChild(s);
  });
};

window.addEventListener('DOMContentLoaded', () => {
  // pre-fill sidebar placeholders in the HTML if any
  document.querySelectorAll('img').forEach(img => {
    if (img.getAttribute('src') && img.getAttribute('src').includes('{{AVATAR}}')) img.src = PORTFOLIO.avatar;
  });
  document.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href')) {
      a.href = a.href.replace('{{GITHUB}}', PORTFOLIO.github || '#')
        .replace('{{LINKEDIN}}', PORTFOLIO.linkedin || '#')
        .replace('{{TWITTER}}', PORTFOLIO.twitter || '#')
        .replace('{{WEBSITE}}', PORTFOLIO.website || '#');
    }
  });

  fillSidebar();
  buildAbout();
  buildProjects();
  buildHeatmap();
});
