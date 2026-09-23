const COUNTIES = [
  "Nairobi","Mombasa","Kisumu","Kiambu","Nakuru","Uasin Gishu","Machakos",
  "Kajiado","Kisii","Kakamega","Meru","Nyeri","Kilifi","Bungoma","Kericho"
];

const SEED = [
  { id: 1, name: "Amina", age: 26, county: "Mombasa", town: "Nyali", km: 3.2, tribe: "Swahili", religion: "Muslim", mode: "Professional", bio: "Ocean walks, chai at sunset, building a small design studio.", interests: ["design","travel","food"], photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=80" },
  { id: 2, name: "Brian", age: 29, county: "Nairobi", town: "Westlands", km: 1.8, tribe: "Kikuyu", religion: "Christian", mode: "Professional", bio: "Product manager who still plays football on Sundays.", interests: ["tech","football","coffee"], photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80" },
  { id: 3, name: "Wanjiku", age: 24, county: "Kiambu", town: "Thika", km: 12.4, tribe: "Kikuyu", religion: "Christian", mode: "Student", bio: "Campus life, spoken word, and late-night mandazi runs.", interests: ["poetry","music","church"], photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" },
  { id: 4, name: "Otieno", age: 31, county: "Kisumu", town: "Milimani", km: 4.1, tribe: "Luo", religion: "Christian", mode: "Professional", bio: "Lakeside evenings, jazz playlists, looking for someone kind.", interests: ["music","cooking","hiking"], photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80" },
  { id: 5, name: "Faith", age: 27, county: "Nairobi", town: "Kilimani", km: 2.6, tribe: "Kalenjin", religion: "Christian", mode: "Church", bio: "Runs at daybreak. Soft life, strong faith.", interests: ["running","church","books"], photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80" },
  { id: 6, name: "Hassan", age: 28, county: "Mombasa", town: "Bamburi", km: 6.0, tribe: "Swahili", religion: "Muslim", mode: "Professional", bio: "Coastal kid. Good conversation over good pilau.", interests: ["food","cars","travel"], photo: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80" }
];

const store = {
  get(k, fallback) {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
  },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const state = {
  view: "landing",
  user: store.get("karibu_user", null),
  likes: store.get("karibu_likes", []),
  matches: store.get("karibu_matches", []),
  reports: store.get("karibu_reports", []),
  chat: store.get("karibu_chat", {}),
  activeChat: null,
  index: 0,
  filters: { county: "All", maxKm: 50, minAge: 21, maxAge: 40, mode: "All" },
  location: store.get("karibu_loc", null)
};

function toast(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function save() {
  store.set("karibu_user", state.user);
  store.set("karibu_likes", state.likes);
  store.set("karibu_matches", state.matches);
  store.set("karibu_reports", state.reports);
  store.set("karibu_chat", state.chat);
  store.set("karibu_loc", state.location);
}

function filteredPeople() {
  return SEED.filter((p) => {
    if (state.user && p.name === state.user.name) return false;
    if (state.filters.county !== "All" && p.county !== state.filters.county) return false;
    if (p.km > Number(state.filters.maxKm)) return false;
    if (p.age < Number(state.filters.minAge) || p.age > Number(state.filters.maxAge)) return false;
    if (state.filters.mode !== "All" && p.mode !== state.filters.mode) return false;
    return !state.likes.includes(p.id) && !state.matches.find((m) => m.id === p.id);
  });
}

function requestLocation() {
  if (!navigator.geolocation) {
    toast("Geolocation not supported — pick a county instead.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      save();
      toast("Location on. Nearby matching uses your coordinates.");
      render();
    },
    () => toast("Location denied. You can still filter by county.")
  );
}

function like(person, yes) {
  if (!person) return;
  if (yes) {
    state.likes.push(person.id);
    if (person.id % 2 === 1) {
      state.matches.push(person);
      if (!state.chat[person.id]) {
        state.chat[person.id] = [
          { from: "them", text: `Sasa ${state.user?.name || ""}. Nice to match with you 👋` }
        ];
      }
      toast(`It's a match with ${person.name}!`);
    } else {
      toast(`You liked ${person.name}`);
    }
  }
  state.index += 1;
  save();
  render();
}

function sendMessage(id, text) {
  if (!text.trim()) return;
  state.chat[id] = state.chat[id] || [];
  state.chat[id].push({ from: "me", text });
  setTimeout(() => {
    state.chat[id].push({ from: "them", text: "Hapo sawa. Tuko nearby — coffee this week?" });
    save();
    render();
  }, 700);
  save();
  render();
}

function Landing() {
  return `
    <div class="wrap">
      <nav class="nav">
        <div class="brand"><div class="logo">K</div> Karibu Nchi</div>
        <div class="nav-actions">
          <button class="btn btn-ghost" data-go="login">Log in</button>
          <button class="btn btn-primary" data-go="signup">Create profile</button>
        </div>
      </nav>
      <section class="hero">
        <div>
          <div class="kicker">Location-based matchmaking · Kenya</div>
          <h1>Meet people who are actually nearby.</h1>
          <p class="lead">Swipe across Nairobi, Mombasa, Kisumu and every county in between. Filter by distance, age, faith, or vibe — student, professional, or church mode.</p>
          <div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">
            <button class="btn btn-primary" data-go="signup">Start matching</button>
            <button class="btn btn-ghost" id="loc-cta">Enable location</button>
          </div>
        </div>
        <div class="hero-card">
          <div class="preview-photo" style="background-image:url('${SEED[0].photo}')">
            <div class="preview-meta">
              <div class="badge">${SEED[0].county} · ${SEED[0].km} km</div>
              <h2 style="font-family:Fraunces,serif;margin-top:8px">${SEED[0].name}, ${SEED[0].age}</h2>
              <p>${SEED[0].bio}</p>
            </div>
          </div>
        </div>
      </section>
      <div class="grid-3">
        <div class="feature"><h3>County + GPS</h3><p>Match by town and distance. Works even if you only share a county.</p></div>
        <div class="feature"><h3>Kenyan filters</h3><p>Age, religion, lifestyle mode, optional tribe, interests.</p></div>
        <div class="feature"><h3>Chat & safety</h3><p>Realtime-style chat demo, report/block, premium + M-Pesa later.</p></div>
      </div>
    </div>`;
}

function Auth(mode) {
  return `
    <div class="wrap">
      <nav class="nav"><div class="brand"><div class="logo">K</div> Karibu Nchi</div>
        <button class="btn btn-ghost" data-go="landing">Home</button></nav>
      <div class="auth-shell">
        <h2 style="font-family:Fraunces,serif;margin-bottom:8px">${mode === "login" ? "Welcome back" : "Create your profile"}</h2>
        <p style="color:var(--muted);margin-bottom:16px">Demo auth is stored in your browser only.</p>
        <form id="auth-form">
          <div class="field"><label>Name</label><input name="name" required value="${state.user?.name || ""}" /></div>
          <div class="field"><label>Email</label><input name="email" type="email" required value="${state.user?.email || ""}" /></div>
          ${mode === "signup" ? `
            <div class="field"><label>Age</label><input name="age" type="number" min="18" value="25" /></div>
            <div class="field"><label>County</label>
              <select name="county">${COUNTIES.map((c) => `<option>${c}</option>`).join("")}</select>
            </div>
            <div class="field"><label>Mode</label>
              <select name="mode"><option>Professional</option><option>Student</option><option>Church</option></select>
            </div>
            <div class="field"><label>Bio</label><textarea name="bio" placeholder="A little about you..."></textarea></div>
          ` : ""}
          <button class="btn btn-primary btn-wide">${mode === "login" ? "Enter app" : "Save & discover"}</button>
        </form>
      </div>
    </div>`;
}

function Shell(inner) {
  const links = [
    ["discover", "Discover"],
    ["matches", "Matches"],
    ["chat", "Chat"],
    ["profile", "Profile"],
    ["safety", "Safety"],
    ["premium", "Premium"]
  ];
  return `
    <div class="app-shell">
      <aside class="side">
        <div class="brand" style="margin-bottom:18px"><div class="logo">K</div> Karibu</div>
        ${links.map(([id, label]) => `<button class="linkish ${state.view===id?"active":""}" data-go="${id}">${label}</button>`).join("")}
        <button class="linkish" id="signout">Sign out</button>
      </aside>
      <main class="main">${inner}</main>
    </div>`;
}

function Discover() {
  const people = filteredPeople();
  const person = people[state.index] || people[0];
  return Shell(`
    <div class="filters">
      <div class="field"><label>County</label>
        <select id="f-county"><option>All</option>${COUNTIES.map((c)=>`<option ${state.filters.county===c?"selected":""}>${c}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Max distance (km)</label>
        <input id="f-km" type="number" value="${state.filters.maxKm}" />
      </div>
      <div class="field"><label>Age min</label><input id="f-min" type="number" value="${state.filters.minAge}" /></div>
      <div class="field"><label>Mode</label>
        <select id="f-mode"><option>All</option><option>Student</option><option>Professional</option><option>Church</option></select>
      </div>
    </div>
    ${person ? `
      <div class="swipe-area">
        <div class="card-stack">
          <div class="person-card" style="background-image:url('${person.photo}')">
            <div class="preview-meta">
              <div class="badge">${person.town}, ${person.county} · ${person.km} km · ${person.mode}</div>
              <h2 style="font-family:Fraunces,serif;margin-top:8px">${person.name}, ${person.age}</h2>
              <p>${person.bio}</p>
              <p style="margin-top:6px;opacity:.85">${person.interests.join(" · ")} · ${person.religion}</p>
            </div>
          </div>
        </div>
        <div class="actions">
          <button class="orb nope" id="nope">✕</button>
          <button class="orb like" id="like">♥</button>
        </div>
      </div>` : `<p>No more people with these filters. Loosen distance or county.</p>`}
  `);
}

function Matches() {
  return Shell(`
    <h2 style="font-family:Fraunces,serif;margin-bottom:14px">Matches</h2>
    <div class="list">
      ${state.matches.length ? state.matches.map((m) => `
        <div class="match-row">
          <img class="avatar" src="${m.photo}" alt="" />
          <div style="flex:1">
            <strong>${m.name}</strong>
            <div style="color:var(--muted);font-size:13px">${m.town}, ${m.county} · ${m.km} km</div>
          </div>
          <button class="btn btn-primary" data-chat="${m.id}">Chat</button>
        </div>`).join("") : `<p style="color:var(--muted)">Like profiles to unlock matches.</p>`}
    </div>`);
}

function Chat() {
  const person = state.matches.find((m) => m.id === state.activeChat) || state.matches[0];
  if (!person) return Shell(`<p>No chats yet. Match someone first.</p>`);
  const msgs = state.chat[person.id] || [];
  return Shell(`
    <div class="chat-box">
      <div><strong>${person.name}</strong> · ${person.town}</div>
      <div class="bubbles">${msgs.map((m)=>`<div class="bubble ${m.from==="me"?"me":"them"}">${m.text}</div>`).join("")}</div>
      <form class="composer" id="chat-form">
        <input name="text" placeholder="Write a message..." />
        <button class="btn btn-primary">Send</button>
      </form>
    </div>`);
}

function Profile() {
  const u = state.user || {};
  return Shell(`
    <div class="auth-shell" style="margin:0">
      <h2 style="font-family:Fraunces,serif">Your profile</h2>
      <p style="color:var(--muted);margin:8px 0 16px">Location: ${state.location ? `${state.location.lat.toFixed(3)}, ${state.location.lng.toFixed(3)}` : "not shared"}</p>
      <button class="btn btn-ghost" id="loc-cta" style="margin-bottom:16px">Share GPS</button>
      <div class="field"><label>Name</label><input id="p-name" value="${u.name || ""}" /></div>
      <div class="field"><label>Bio</label><textarea id="p-bio">${u.bio || ""}</textarea></div>
      <button class="btn btn-primary" id="save-profile">Save profile</button>
    </div>`);
}

function Safety() {
  return Shell(`
    <h2 style="font-family:Fraunces,serif;margin-bottom:10px">Safety</h2>
    <p style="color:var(--muted);margin-bottom:16px">Report harassment, fake profiles, or unsafe meetups. In production this goes to moderators.</p>
    <form id="report-form" class="auth-shell" style="margin:0">
      <div class="field"><label>Person or issue</label><input name="who" required /></div>
      <div class="field"><label>Details</label><textarea name="details" required></textarea></div>
      <button class="btn btn-danger btn-wide">Submit report</button>
    </form>
    <p style="margin-top:14px;color:var(--muted)">${state.reports.length} report(s) saved locally.</p>
  `);
}

function Premium() {
  return Shell(`
    <h2 style="font-family:Fraunces,serif">Karibu+ </h2>
    <p style="color:var(--muted);max-width:520px;margin:8px 0 18px">See who liked you, boost your profile in your county, and unlock unlimited likes. Payments can hook into M-Pesa STK push later.</p>
    <div class="grid-3">
      <div class="feature"><h3>Free</h3><p>10 likes / day, county filters, chat after match.</p></div>
      <div class="feature"><h3>Plus · KES 499</h3><p>Unlimited likes, 1 boost / week.</p></div>
      <div class="feature"><h3>Gold · KES 999</h3><p>See likes, travel mode, priority support.</p></div>
    </div>
    <button class="btn btn-green" style="margin-top:18px" id="mpesa">Pay with M-Pesa (demo)</button>
  `);
}

function viewHTML() {
  switch (state.view) {
    case "login": return Auth("login");
    case "signup": return Auth("signup");
    case "discover": return Discover();
    case "matches": return Matches();
    case "chat": return Chat();
    case "profile": return Profile();
    case "safety": return Safety();
    case "premium": return Premium();
    default: return Landing();
  }
}

function bind() {
  document.querySelectorAll("[data-go]").forEach((el) => {
    el.onclick = () => { state.view = el.dataset.go; if (el.dataset.go === "discover") state.index = 0; render(); };
  });
  const loc = document.getElementById("loc-cta");
  if (loc) loc.onclick = requestLocation;
  const form = document.getElementById("auth-form");
  if (form) form.onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    state.user = { ...state.user, ...data };
    state.view = "discover";
    save();
    render();
  };
  const likeBtn = document.getElementById("like");
  const nopeBtn = document.getElementById("nope");
  const people = filteredPeople();
  const person = people[state.index] || people[0];
  if (likeBtn) likeBtn.onclick = () => like(person, true);
  if (nopeBtn) nopeBtn.onclick = () => like(person, false);
  ["f-county","f-km","f-min","f-mode"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onchange = () => {
      if (id === "f-county") state.filters.county = el.value;
      if (id === "f-km") state.filters.maxKm = el.value;
      if (id === "f-min") state.filters.minAge = el.value;
      if (id === "f-mode") state.filters.mode = el.value;
      state.index = 0;
      render();
    };
  });
  document.querySelectorAll("[data-chat]").forEach((el) => {
    el.onclick = () => { state.activeChat = Number(el.dataset.chat); state.view = "chat"; render(); };
  });
  const chatForm = document.getElementById("chat-form");
  if (chatForm) chatForm.onsubmit = (e) => {
    e.preventDefault();
    const person = state.matches.find((m) => m.id === state.activeChat) || state.matches[0];
    sendMessage(person.id, new FormData(chatForm).get("text"));
  };
  const saveP = document.getElementById("save-profile");
  if (saveP) saveP.onclick = () => {
    state.user = { ...state.user, name: document.getElementById("p-name").value, bio: document.getElementById("p-bio").value };
    save(); toast("Profile saved");
  };
  const report = document.getElementById("report-form");
  if (report) report.onsubmit = (e) => {
    e.preventDefault();
    state.reports.push(Object.fromEntries(new FormData(report)));
    save(); toast("Report received"); render();
  };
  const mpesa = document.getElementById("mpesa");
  if (mpesa) mpesa.onclick = () => toast("M-Pesa STK demo — connect Daraja API in production.");
  const out = document.getElementById("signout");
  if (out) out.onclick = () => { state.view = "landing"; render(); };
}

function render() {
  document.getElementById("app").innerHTML = viewHTML();
  bind();
}

if (state.user) state.view = "discover";
render();
