import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_ORIGIN } from '../services/apiBase';
import { fullName } from '../utils/profileFormHelpers';
import {
  BRANCH_ADDRESS_LINES,
  BRAND,
  CITIES,
  EMAIL,
  HELPLINE_DISPLAY,
  HELPLINE_TEL,
  MAP_EMBED,
  MOTHER_TONGUES,
  ORG,
  REGISTER_CTA,
  REGISTRATION_FEE,
  RENEWAL_FEE,
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
    q: 'Will my phone number be public?',
    a: 'No. Mobile numbers and email stay hidden on browse cards and downloadable biodata. Contact is shared only when both families agree, or through our Vijayawada office.'
  },
  {
    q: 'What does registration cost?',
    a: `Registration is ${REGISTRATION_FEE}. Annual renewal is ${RENEWAL_FEE}. Call the Vijayawada office if you have questions about payment.`
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
        name: fullName(p) || (p.gender === 'female' ? 'Bride' : p.gender === 'male' ? 'Groom' : 'Member'),
        city: p.currentAddress?.city || p.presentAddress?.city || '',
        work: p.occupation || p.highestEducation || '',
        photo: photoSrc((p.photos || []).find((x) => x.isPrimary) || (p.photos || [])[0])
      }));
    }
    return [
      { id: 'vja', name: 'Bride', city: 'Vijayawada', work: 'Teacher', photo: FEATURE_PHOTOS[0] },
      { id: 'gnt', name: 'Groom', city: 'Vijayawada', work: 'Engineer', photo: FEATURE_PHOTOS[1] },
      { id: 'hyd', name: 'Bride', city: 'Hyderabad', work: 'Nurse', photo: FEATURE_PHOTOS[2] },
      { id: 'nri', name: 'Groom', city: 'Guntur', work: 'IT professional', photo: FEATURE_PHOTOS[3] }
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
            For fifteen years in <strong>Vijayawada</strong>,{' '}
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
            <Link to={registerPath} className="btn-gold">{REGISTER_CTA}</Link>
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
            { n: 'Bride or Groom', l: 'We introduce bride or groom to families' },
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
              { t: `Backed by ${ORG}`, d: 'An institution with a Vijayawada office, not a faceless app. You can walk in and speak to someone.' },
              { t: 'We introduce bride or groom', d: 'Our team introduces a bride or a groom to the family, with dignity and a person you can call.' },
              { t: 'Privacy in your control', d: 'Mobile numbers are hidden until both families agree. Downloadable biodata never prints phone or email.' },
              { t: 'Parents together', d: 'Mothers and fathers can complete biodata and stay involved at every step of the search.' },
              { t: 'A person on the phone', d: 'Call or WhatsApp the Vijayawada office. We help families meet only when both sides are ready.' }
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
              { n: '1', t: 'Register', d: `Create a login with name, surname and mobile. Registration is ${REGISTRATION_FEE}.` },
              { n: '2', t: 'Complete biodata', d: 'Add family, education, present address and partner requirement.' },
              { n: '3', t: 'See matches', d: 'Search by city, age and community, or ask us to introduce a bride or groom.' },
              { n: '4', t: 'Meet with support', d: 'Speak, visit the Vijayawada office, and take the next step only when both families are ready.' }
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
          <h2>Brides and grooms we introduce</h2>
          <p className="sub">
            {isAuthenticated
              ? 'A sample of members currently on New Kalyanamala.'
              : `Register to see biodata. Registration is ${REGISTRATION_FEE}. Phone numbers stay private.`}
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
          <h2>Membership</h2>
          <p className="sub">One Vijayawada office. Registration and yearly renewal — no free plan.</p>
          <div className="plans">
            <article className="plan-card featured">
              <h3>Registration</h3>
              <p>{REGISTRATION_FEE}</p>
              <ul>
                <li>Create a biodata for a bride or groom</li>
                <li>Appear in search for Mala families</li>
                <li>Helpline support from Vijayawada</li>
              </ul>
              <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
            </article>
            <article className="plan-card">
              <h3>Annual renewal</h3>
              <p>{RENEWAL_FEE}</p>
              <ul>
                <li>Keep the profile active for another year</li>
                <li>Continue introductions with our team</li>
                <li>Same privacy and Vijayawada support</li>
              </ul>
              <Link to="/#contact" className="btn-maroon">Talk to us</Link>
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
              { names: 'Suresh & Anitha', place: 'Vijayawada', quote: 'Our parents met at the office first. We felt looked after, not rushed.' },
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
            {ORG} has served Mala families from its Vijayawada office for {YEARS_OF_SERVICE} years.
            {' '}{BRAND} is the matrimonial service of the samstha — not a marketplace for every community,
            and not a casual dating site. Elders, working professionals and NRIs use the same careful process:
            a biodata, a conversation with our team, and an introduction only when both families wish it.
            We exist so that a Mala bride or groom, and the parents who stand with them, can search with trust.
            Our only office is in Vijayawada.
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
                <li>Photographs that do not belong to the member are not shown in search.</li>
                <li>We never ask you to transfer money to a member or to a private account for a “priority match”.</li>
                <li>Report a suspicious profile to the Vijayawada office; we will take it down while we check.</li>
                <li>Meet in a public place or at the Vijayawada office. Tell a family member where you are going.</li>
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
              { t: 'Introductions', d: 'We introduce a bride or a groom to the family when both sides are ready.' },
              { t: 'Parent meetings', d: 'Families can meet at the Vijayawada office with our team present.' },
              { t: 'NRI support', d: 'Families abroad can search Telugu Mala matches while parents handle meetings at the Vijayawada office.' },
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
          <h2>Vijayawada office</h2>
          <p className="sub">Walk in at Manohara Apartments, Machavaram. Call or WhatsApp {HELPLINE_DISPLAY}. Our only office is in Vijayawada.</p>
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
              <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
            </div>
            <iframe
              className="map-frame"
              title="Vijayawada office map"
              src={MAP_EMBED}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
        <p>Registration is {REGISTRATION_FEE}. Annual renewal is {RENEWAL_FEE}. Talk to {ORG} in Vijayawada whenever you need a person, not only a website.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 18 }}>
          <Link to="/register" className="btn-gold">{REGISTER_CTA}</Link>
          <a href={HELPLINE_TEL} className="btn-ghost">Call {HELPLINE_DISPLAY}</a>
        </div>
      </section>

      {!isAuthenticated && (
        <div className="mobile-register">
          <a className="btn-ghost" href={HELPLINE_TEL}>Call</a>
          <Link className="btn-gold" to="/register">{REGISTER_CTA}</Link>
        </div>
      )}
    </div>
  );
};

export default Home;
