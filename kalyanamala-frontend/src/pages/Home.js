import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ORIGIN } from '../services/apiBase';
import { fullName } from '../utils/profileFormHelpers';
import {
  BRANCH_ADDRESS_LINES,
  BRANCHES,
  BRAND,
  CITIES,
  EMAIL,
  HELPLINE_DISPLAY,
  HELPLINE_TEL,
  MAP_EMBED,
  MOTHER_TONGUES,
  ORG,
  SUB_COMMUNITIES,
  WHATSAPP_HREF,
  YEARS_OF_SERVICE
} from '../siteConfig';

const HERO_PHOTO =
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=65';

const STORY_PHOTOS = [
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=65',
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=65',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=65'
];

const FEATURE_PHOTOS = [
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1617575521317-d297bfdc5c48?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=60',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=60'
];

const FAQ = [
  {
    q: 'Is New Kalyanamala only for the Mala community?',
    a: 'Yes. This service is exclusively for Mala families — Hindu, Christian, Ambedkarist and Buddhist — so parents can search among people who share community, language and family values.'
  },
  {
    q: 'Can parents manage the profile?',
    a: 'Yes. Many biodata are completed by mothers and fathers. You may register in the candidate’s name, keep phone numbers private, and call the Vijayawada office whenever you need a person to walk you through a match.'
  },
  {
    q: 'How do you verify a profile?',
    a: 'Our team reviews photographs, education, family details and contact information before a profile is shown in search. We do not publish unverified biodata.'
  },
  {
    q: 'Will my phone number be public?',
    a: 'No. Mobile numbers and email stay hidden on browse cards and downloadable biodata. Contact is shared only when both families agree, or through our assisted service.'
  },
  {
    q: 'Do you match horoscopes?',
    a: 'Yes. On request we arrange horoscope matching and share the outcome with both families. It is optional; some Christian Mala families prefer church and family references instead.'
  },
  {
    q: 'Is registration really free?',
    a: 'Creating a biodata and appearing in search after verification is free. Premium and Assisted plans add more introductions, priority support and help from the Vijayawada branch.'
  }
];

const photoSrc = (p) => (!p ? '' : typeof p === 'string' ? p : p.url || p.imageUrl || '');

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token } = useContext(AuthContext);
  const [openFaq, setOpenFaq] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState({
    looking: 'bride',
    ageMin: '21',
    ageMax: '32',
    community: '',
    tongue: 'Telugu',
    city: 'Vijayawada'
  });

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location.hash]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_ORIGIN}/api/profiles/browse`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfiles((res.data.profiles || []).slice(0, 8));
      } catch (err) {
        setProfiles([]);
      }
    };
    load();
  }, [token]);

  const featured = useMemo(() => {
    if (profiles.length) {
      return profiles.map((p) => ({
        id: p.profileId || p._id,
        name: fullName(p) || 'Verified member',
        city: p.currentAddress?.city || p.presentAddress?.city || '',
        work: p.occupation || p.highestEducation || '',
        photo: photoSrc((p.photos || []).find((x) => x.isPrimary) || (p.photos || [])[0])
      }));
    }
    return [
      { id: 'vja', name: 'Verified bride', city: 'Vijayawada', work: 'Teacher', photo: FEATURE_PHOTOS[0] },
      { id: 'hyd', name: 'Verified groom', city: 'Hyderabad', work: 'Engineer', photo: FEATURE_PHOTOS[1] },
      { id: 'gnt', name: 'Verified bride', city: 'Guntur', work: 'Nurse', photo: FEATURE_PHOTOS[2] },
      { id: 'nri', name: 'Verified groom', city: 'NRI', work: 'IT professional', photo: FEATURE_PHOTOS[3] }
    ];
  }, [profiles]);

  const submitSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      looking: search.looking,
      ageMin: search.ageMin,
      ageMax: search.ageMax,
      community: search.community,
      tongue: search.tongue,
      city: search.city
    });
    navigate(`/browse?${params.toString()}`);
  };

  const registerPath = isAuthenticated ? '/browse' : '/register';

  return (
    <div>
      <section
        className="home-hero"
        style={{ '--hero-image': `url(${HERO_PHOTO})` }}
      >
        <div className="home-hero-inner">
          <h1>
            Where families meet,<br />
            hopes blossom,<br />
            and <em>lifelong bonds</em> begin.
          </h1>
          <p className="lede verse">
            For twenty years in <strong>Vijayawada</strong>,{' '}
            <strong>{BRAND}</strong> has lovingly brought together
            hearts, hopes, and families within the <strong>Mala community</strong>.
          </p>
          <p className="lede verse">
            Guided by <strong>{ORG}</strong>,
            we help every candidate and every caring parent
            discover a meaningful bond—
            with <em>dignity</em> in every step,{' '}
            <em>privacy</em> in every moment,
            and a <em>trusted hand</em> to hold throughout the journey.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
            <Link to={registerPath} className="btn-gold">Register Free</Link>
            <a href={HELPLINE_TEL} className="btn-ghost">Call {HELPLINE_DISPLAY}</a>
          </div>
          <form className="search-widget" onSubmit={submitSearch}>
            <div>
              <label htmlFor="looking">Looking for</label>
              <select id="looking" value={search.looking} onChange={(e) => setSearch({ ...search, looking: e.target.value })}>
                <option value="bride">Bride</option>
                <option value="groom">Groom</option>
              </select>
            </div>
            <div>
              <label htmlFor="ageMin">Age from</label>
              <input id="ageMin" type="number" min="18" max="60" value={search.ageMin} onChange={(e) => setSearch({ ...search, ageMin: e.target.value })} />
            </div>
            <div>
              <label htmlFor="ageMax">Age to</label>
              <input id="ageMax" type="number" min="18" max="70" value={search.ageMax} onChange={(e) => setSearch({ ...search, ageMax: e.target.value })} />
            </div>
            <div>
              <label htmlFor="community">Sub-community</label>
              <select id="community" value={search.community} onChange={(e) => setSearch({ ...search, community: e.target.value })}>
                {SUB_COMMUNITIES.map((item) => (
                  <option key={item.label} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tongue">Mother tongue</label>
              <select id="tongue" value={search.tongue} onChange={(e) => setSearch({ ...search, tongue: e.target.value })}>
                {MOTHER_TONGUES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city">City</label>
              <select id="city" value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn-maroon" style={{ width: '100%' }}>Search matches</button>
            </div>
          </form>
        </div>
      </section>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="counters">
          {[
            { n: `${YEARS_OF_SERVICE}+`, l: 'Years of service from Vijayawada' },
            { n: 'Verified', l: 'Verified profiles reviewed by our team' },
            { n: 'Marriages', l: 'Successful marriages with parents involved' },
            { n: 'Private', l: 'Privacy assurance — phone and email stay hidden' }
          ].map((item) => (
            <div key={item.l} className="counter-card">
              <strong>{item.n}</strong>
              {item.l}
            </div>
          ))}
        </div>
      </div>

      <section className="band" id="why">
        <div className="section">
          <h2>Why families choose {BRAND}</h2>
          <p className="sub">Built for the candidate and for the parents who often make the final decision.</p>
          <div className="why-grid">
            {[
              { t: 'Only the Mala community', d: 'Hindu, Christian, Ambedkarist and Buddhist Mala families search among their own people — not a mixed general portal.' },
              { t: `Backed by ${ORG}`, d: 'An institution with a Vijayawada main branch, not a faceless app. You can walk in and speak to someone.' },
              { t: 'Manual verification', d: 'Photographs, education and family details are checked before a profile is shown in search.' },
              { t: 'Privacy in your control', d: 'Mobile numbers are hidden until both families agree. Downloadable biodata never prints phone or email.' },
              { t: 'Horoscope matching', d: 'On request we arrange matching and share the result with both houses. It remains optional.' },
              { t: 'A person on the phone', d: 'Call or WhatsApp the Vijayawada office. Assisted members get a coordinator for parent meetings.' }
            ].map((item) => (
              <article key={item.t} className="why-card">
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="how">
        <div className="section">
          <h2>How it works</h2>
          <p className="sub">Four clear steps. Parents are welcome at every stage.</p>
          <div className="steps">
            {[
              { n: '1', t: 'Register free', d: 'Create a login with name, surname and mobile. No charge to begin.' },
              { n: '2', t: 'Complete biodata', d: 'Add family, education, present address and partner requirement. Our team verifies it.' },
              { n: '3', t: 'See matches', d: 'Search by city, age and community, or ask us to shortlist for the parents.' },
              { n: '4', t: 'Meet with support', d: 'Speak, visit the Vijayawada branch, and take the next step only when both families are ready.' }
            ].map((item) => (
              <article key={item.n} className="step-card">
                <div className="step-num">{item.n}</div>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="featured">
        <div className="section">
          <h2>Featured verified profiles</h2>
          <p className="sub">
            {isAuthenticated
              ? 'A sample of members currently on New Kalyanamala.'
              : 'Register free to open full verified biodata. Phone numbers stay private.'}
          </p>
          <div className="carousel">
            {featured.map((p) => (
              <article key={p.id} className="profile-card">
                <img src={p.photo || FEATURE_PHOTOS[0]} alt="" loading="lazy" />
                <div className="meta">
                  <strong>{p.name}</strong>
                  <div>{[p.work, p.city].filter(Boolean).join(' · ')}</div>
                  <Link to={isAuthenticated ? '/browse' : '/register'} className="btn-maroon" style={{ marginTop: 10 }}>
                    {isAuthenticated ? 'View matches' : 'Register to view'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="browse-by">
        <div className="section">
          <h2>Browse matches by</h2>
          <div className="tag-grid">
            {[
              ['City · Vijayawada', 'city=Vijayawada'],
              ['City · Guntur', 'city=Guntur'],
              ['City · Bangalore', 'city=Bangalore'],
              ['Profession', 'q=engineer'],
              ['Education', 'q=btech'],
              ['NRI · United States', 'city=NRI'],
              ['Second marriage', 'q=second']
            ].map(([label, q]) => (
              <Link key={label} className="tag" to={`/browse?${q}`}>{label}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="membership">
        <div className="section">
          <h2>Membership plans</h2>
          <p className="sub">Start free. Move to Premium or Assisted when the family wants more introductions.</p>
          <div className="plans">
            <article className="plan-card">
              <h3>Free</h3>
              <p>For families beginning a search.</p>
              <ul>
                <li>Create and verify a biodata</li>
                <li>Appear in search after review</li>
                <li>Limited match views</li>
              </ul>
              <Link to="/register" className="btn-maroon">Register Free</Link>
            </article>
            <article className="plan-card featured">
              <h3>Premium</h3>
              <p>For active searches that need more reach.</p>
              <ul>
                <li>More profile views and highlights</li>
                <li>Priority in search</li>
                <li>Helpline support from Vijayawada</li>
              </ul>
              <Link to="/#contact" className="btn-gold">Talk to us</Link>
            </article>
            <article className="plan-card">
              <h3>Assisted</h3>
              <p>A coordinator works with both sets of parents.</p>
              <ul>
                <li>Shortlists prepared for you</li>
                <li>Horoscope matching on request</li>
                <li>Meetings arranged at the branch</li>
              </ul>
              <Link to="/#contact" className="btn-maroon">Request assisted search</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="band-cream" id="stories">
        <div className="section">
          <h2>Success stories</h2>
          <p className="sub">Families who found a match with patience, privacy and the support of {ORG}.</p>
          <div className="stories">
            {[
              { names: 'Suresh & Anitha', place: 'Vijayawada', quote: 'Our parents met at the branch first. We felt looked after, not rushed.' },
              { names: 'Ravi & Lakshmi', place: 'Guntur · Hyderabad', quote: 'They kept our numbers private until both houses were comfortable. That mattered to my mother.' },
              { names: 'Praveen & Mary', place: 'Christian Mala families', quote: 'We needed a community match with shared faith. New Kalyanamala understood that from the first call.' }
            ].map((s, i) => (
              <article key={s.names} className="story-card">
                <img src={STORY_PHOTOS[i]} alt="" loading="lazy" />
                <div className="meta">
                  <strong>{s.names}</strong>
                  <div>{s.place}</div>
                  <p>“{s.quote}”</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="about">
        <div className="section">
          <h2>About {ORG}</h2>
          <p className="sub">
            {ORG} has served Mala families from its main branch in Vijayawada for {YEARS_OF_SERVICE} years,
            with offices across Andhra Pradesh, Bangalore, Chennai and the United States.
            {' '}{BRAND} is the matrimonial service of the samstha — not a marketplace for every community,
            and not a casual dating site. Elders, working professionals and NRIs use the same careful process:
            a verified biodata, a conversation with our team, and an introduction only when both families wish it.
            We exist so that a Mala bride or groom, and the parents who stand with them, can search with trust.
          </p>
        </div>
      </section>

      <section className="band-cream" id="safety">
        <div className="section">
          <div className="safety-grid">
            <div>
              <h2>Safety and anti-fraud</h2>
              <p className="sub">We would rather delay a profile than publish a doubtful one.</p>
              <ul>
                <li>Unverified photographs are not shown in search.</li>
                <li>We never ask you to transfer money to a member or to a private account for a “priority match”.</li>
                <li>Report a suspicious profile to the Vijayawada office; we will take it down while we check.</li>
                <li>Meet in a public place or at the branch. Tell a family member where you are going.</li>
              </ul>
            </div>
            <div className="why-card">
              <h3>If something feels wrong</h3>
              <p>Call {HELPLINE_DISPLAY} or write to {EMAIL}. Do not share OTPs, bank details or original certificates on first contact.</p>
              <a className="btn-maroon" href={HELPLINE_TEL}>Call the helpline</a>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="services">
        <div className="section">
          <h2>Services</h2>
          <div className="why-grid">
            {[
              { t: 'Biodata help', d: 'Sit with our team in Vijayawada to complete education, family and partner requirement clearly.' },
              { t: 'Verification', d: 'Document and photograph checks before a profile is searchable.' },
              { t: 'Horoscope matching', d: 'Optional matching shared with both families.' },
              { t: 'Parent meetings', d: 'Assisted members can meet at the main branch with a coordinator present.' },
              { t: 'NRI support', d: 'Families abroad can search Telugu Mala matches while parents handle meetings here.' },
              { t: 'Second marriage', d: 'Discreet search for divorced or widowed members, with the same privacy rules.' }
            ].map((item) => (
              <article key={item.t} className="why-card">
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="contact">
        <div className="section">
          <h2>Vijayawada main branch</h2>
          <p className="sub">Walk in at Manohara Apartments, Machavaram. Call or WhatsApp {HELPLINE_DISPLAY} from any of our branches.</p>
          <div className="branch-grid">
            <div>
              <p><strong>{ORG}</strong></p>
              {BRANCH_ADDRESS_LINES.map((line) => (
                <p key={line} style={{ margin: '0 0 4px' }}>{line}</p>
              ))}
              <p>Phone: <a href={HELPLINE_TEL}>{HELPLINE_DISPLAY}</a></p>
              <p>WhatsApp: <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer">{HELPLINE_DISPLAY}</a></p>
              <p>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
              <p>Walk in with the family. Appointments are preferred on weekdays.</p>
              <Link to="/register" className="btn-gold">Register Free</Link>
            </div>
            <iframe
              className="map-frame"
              title="Vijayawada main branch map"
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <h3 className="branch-heading">Our branches</h3>
          <p className="sub">Andhra Pradesh, Bangalore, Chennai and the United States — one samstha, the same careful process.</p>
          <div className="branch-list">
            {BRANCHES.map((b) => (
              <Link
                key={b.city}
                className={b.main ? 'branch-pill main' : 'branch-pill'}
                to={`/browse?${b.query}`}
              >
                {b.city}{b.main ? ' · Main' : ''}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="faq">
        <div className="section">
          <h2>Questions parents ask</h2>
          {FAQ.map((item, i) => (
            <div key={item.q} className="faq-item">
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                {item.q}
              </button>
              {openFaq === i && <div className="faq-body">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="band-maroon cta-band" id="register-cta">
        <h2>Begin a careful search for your son or daughter</h2>
        <p>Register free. Talk to {ORG} in Vijayawada whenever you need a person, not only a website.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
          <Link to="/register" className="btn-gold">Register Free</Link>
          <a href={HELPLINE_TEL} className="btn-ghost">Call {HELPLINE_DISPLAY}</a>
        </div>
      </section>

      {!isAuthenticated && (
        <div className="mobile-register">
          <a className="btn-ghost" href={HELPLINE_TEL}>Call</a>
          <Link className="btn-gold" to="/register">Register Free</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
