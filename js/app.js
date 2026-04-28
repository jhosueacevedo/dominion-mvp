// ===============================
// STATE MANAGEMENT & LOCAL STORAGE
// ===============================
const STORAGE_KEY = 'dominion_data';

const defaultState = {
  isFirstLaunch: true,
  age: null,
  country: null,
  relationship: null,
  battles: [],
  frequency: null,
  feelings: [],
  userId: null,
  why: '',
  startDate: null,
  currentStreak: 0,
  bestStreak: 0,
  missionsCompleted: {}, // { 'yyyy-mm-dd': true }
  sosUsage: [], // { date, trigger }
  relapses: [], // { date, streakLost, reason }
  settings: {
    notifications: false,
    time: '08:00'
  }
};

let appState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { ...defaultState };

if (!appState.userId) {
  appState.userId = 'user-' + Math.random().toString(36).substring(2, 6).toLowerCase() + Math.floor(Math.random() * 99);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

// ===============================
// MOCK DATA (Phase 1 Clinical Drafts)
// ===============================
const MOTIVATIONS = [
  "Strong. Keep going.",
  "One decision at a time.",
  "You are built for this.",
  "Hold the line today.",
  "Your dominion awaits."
];

const SOS_SCRIPTURES = [
  "Like a city whose walls are broken through is a person who lacks self-control. — Proverbs 25:28",
  "The one who conquers himself is greater than the one who conquers a city.",
  "No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness.",
  "Submit yourselves, then, to God. Resist the devil, and he will flee from you."
];

const SOS_ACTIONS = [
  "Get up and drink a glass of water",
  "Do 20 pushups right now",
  "Text a friend — say anything",
  "Step outside for 60 seconds",
  "Write down what you're feeling"
];

const MISSIONS = [
  { day: 1, title: "The Choice", text: "Today is about making a definitive choice. It's not about the next 90 days, it's about the next 24 hours. Will you commit to being present in this reality, rather than escaping it?" },
  { day: 2, title: "Identify the Void", text: "What are you actually medicating? Stress? Loneliness? Boredom? Escapism thrives when we don't address the root. Today, reflect on what emotion preceded your last urge." },
  { day: 3, title: "Reclaim Your Environment", text: "Your environment dictates your habits. Where do you typically fall? The bed? The bathroom? Change the environment. Don't bring the phone into that space today." },
  { day: 4, title: "Embrace the Tension", text: "Urges are just signals in the body. They peak and they pass. You don't have to act on them. Today, if tension rises, observe it without obeying it." },
  { day: 5, title: "The Power of Your Why", text: "You wrote down a reason for doing this. Return to it today. Is it for your future spouse? Your children? Your integrity? Keep that vision front and center." },
  { day: 6, title: "Shattering the Secret", text: "Shame thrives in darkness. Have you told anyone about this battle? The moment you speak it to a trusted brother, it loses 80% of its power." },
  { day: 7, title: "One Week of Dominion", text: "You've proven it is possible. The foundation is laid. Now, we build. Stay vigilant; the first weekend is often the hardest." }
];

const GLOBAL_COUNTRIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea (North)", "Korea (South)", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

// ===============================
// ROUTER & CORE UI CONTROLLER
// ===============================
const mainContent = document.getElementById('main-content');
const topbar = document.getElementById('topbar');
const bottomNav = document.getElementById('bottom-nav');

function navigateTo(screen, props = {}) {
  // Clear main content
  mainContent.innerHTML = '';
  
  // Manage navigation visibility
  if (['splash', 'onboarding', 'sos', 'mission_active', 'welcome'].includes(screen)) {
    topbar.classList.add('hidden');
    bottomNav.classList.add('hidden');
  } else {
    topbar.classList.remove('hidden');
    bottomNav.classList.remove('hidden');
  }

  // Update active nav item status
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
    if (el.dataset.target === screen) {
      el.classList.add('active');
    }
  });

  // Render requested screen
  switch(screen) {
    case 'splash': renderSplash(); break;
    case 'onboarding': renderOnboarding(); break;
    case 'home': renderHome(); break;
    case 'mission': renderMissionList(); break;
    case 'mission_active': renderMissionActive(props.day || 1); break;
    case 'sos': renderSOSFlow(); break;
    case 'welcome': renderWelcome(); break;
    case 'journey': renderJourney(); break;
    case 'settings-page': renderSettings(); break;
  }
  
  // Refresh Feather Icons
  feather.replace();
}

// Global Nav Listeners
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.target));
});

document.getElementById('btn-settings').addEventListener('click', () => {
  navigateTo('settings-page');
});

// ===============================
// SCREENS
// ===============================

// 1. Splash
function renderSplash() {
  mainContent.innerHTML = `
    <div class="splash-container">
      <div class="dom-wordmark">DOMIN<span class="text-orange">I</span>ON</div>
    </div>
  `;
  setTimeout(() => {
    if (appState.isFirstLaunch) {
      navigateTo('onboarding');
    } else {
      navigateTo('home');
    }
  }, 2000);
}

// 2. Onboarding
function renderOnboarding() {
  let step = 1;
  const data = {
    age: null,
    country: null,
    relationship: null,
    battles: [],
    frequency: null,
    feelings: [],
    why: ''
  };

  const updateStep = () => {
    mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'screen justify-center';
    
    // UI Templates
    if (step === 1) { // Intro
      container.className = 'screen flex-col justify-center items-center text-center';
      container.innerHTML = `
        <div style="width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <h1 class="anim-fade-up" style="font-family: 'Syne', sans-serif; font-weight: 700; font-size: 38px; color: #fff; margin: 0; line-height: 1.2; animation-delay: 0ms;">Your Life.</h1>
          <h1 class="anim-fade-up" style="font-family: 'Syne', sans-serif; font-weight: 700; font-size: 38px; color: #fff; margin: 0; line-height: 1.2; animation-delay: 500ms;">Your Purpose.</h1>
          <h1 class="anim-fade-up" style="font-family: 'Syne', sans-serif; font-weight: 700; font-size: 38px; color: #f97316; margin: 0; line-height: 1.2; animation-delay: 1000ms;">Your Dominion.</h1>
          
          <div class="anim-expand-line" style="height: 1px; background: #f97316; margin: 2rem auto; animation-delay: 1800ms;"></div>
          
          <p class="anim-fade-up" style="font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 14px; color: #a89890; margin: 0 auto 3rem auto; max-width: 280px; line-height: 1.6; animation-delay: 2300ms;">
            We don't help men become better. We help them become who they were always called to be.
          </p>

          <button id="btn-next" class="anim-fade-up btn btn-primary" style="width: 100%; border-radius: 8px; animation-delay: 3100ms;">Get Started</button>
        </div>
      `;
    } else if (step === 2) { // Age
      container.innerHTML = `
        <h1 class="mb-2">How old are you?</h1>
        <div class="card selectable" data-val="18-24"><h3 class="mb-1">18–24</h3></div>
        <div class="card selectable" data-val="25-34"><h3 class="mb-1">25–34</h3></div>
        <div class="card selectable" data-val="35-44"><h3 class="mb-1">35–44</h3></div>
        <div class="card selectable" data-val="45+"><h3 class="mb-1">45+</h3></div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 3) { // Country
      container.innerHTML = `
        <h1 class="mb-2">Where are you joining from?</h1>
        <p class="mb-4">Select your location.</p>
        <div style="position:relative; width:100%; margin-bottom: 2rem;">
          <input type="text" id="country-input" autocomplete="off" placeholder="Type your country..." style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1rem; background: var(--surface-color); color: var(--text-white); border: 1px solid var(--border-color);">
          <div id="country-autocomplete-list" class="autocomplete-list"></div>
        </div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 4) { // Relationship
      container.innerHTML = `
        <h1 class="mb-2">What's your relationship status?</h1>
        <div class="card selectable" data-val="Single"><h3 class="mb-1">Single</h3></div>
        <div class="card selectable" data-val="In a relationship"><h3 class="mb-1">In a relationship</h3></div>
        <div class="card selectable" data-val="Engaged"><h3 class="mb-1">Engaged</h3></div>
        <div class="card selectable" data-val="Married"><h3 class="mb-1">Married</h3></div>
        <div class="card selectable" data-val="Divorced / Separated"><h3 class="mb-1">Divorced / Separated</h3></div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 5) { // Battle
      container.innerHTML = `
        <h1 class="mb-2">What are you fighting?</h1>
        <p class="mb-4">Be honest. No one is watching.</p>
        <div class="card selectable" data-val="Pornography"><h3 class="mb-1">🔴 Pornography</h3></div>
        <div class="card selectable" data-val="Masturbation"><h3 class="mb-1">🔴 Masturbation</h3></div>
        <div class="card selectable" data-val="Both"><h3 class="mb-1">🔴 Both</h3></div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 6) { // Frequency
      container.innerHTML = `
        <h1 class="mb-2">How often does this happen?</h1>
        <p class="mb-4">There's no wrong answer here.</p>
        <div class="card selectable" data-val="Every day"><h3 class="mb-1">Every day</h3></div>
        <div class="card selectable" data-val="Several times a week"><h3 class="mb-1">Several times a week</h3></div>
        <div class="card selectable" data-val="Once a week or less"><h3 class="mb-1">Once a week or less</h3></div>
        <div class="card selectable" data-val="I relapsed recently and want to restart"><h3 class="mb-1">I relapsed recently and want to restart</h3></div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 7) { // Feelings
      container.innerHTML = `
        <h1 class="mb-2">How does this make you feel?</h1>
        <p class="mb-4">Select all that apply.</p>
        <div class="card selectable-multi" data-val="Ashamed"><h3 class="mb-1">😔 Ashamed</h3></div>
        <div class="card selectable-multi" data-val="Frustrated with myself"><h3 class="mb-1">😤 Frustrated with myself</h3></div>
        <div class="card selectable-multi" data-val="Out of control"><h3 class="mb-1">😰 Out of control</h3></div>
        <div class="card selectable-multi" data-val="Numb"><h3 class="mb-1">😶 Numb — I don't feel much anymore</h3></div>
        <div class="card selectable-multi" data-val="Letting people down"><h3 class="mb-1">😟 Like I'm letting people down</h3></div>
        <div class="card selectable-multi" data-val="Stuck"><h3 class="mb-1">😞 Stuck in a cycle I can't break</h3></div>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 8) { // Why
      container.innerHTML = `
        <h1 class="mb-2">Why do you want to change?</h1>
        <p class="mb-4">This will appear when you need it most.</p>
        <textarea id="why-input" rows="4" placeholder="Write your reason here..." maxlength="140"></textarea>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2; opacity: 0.5; pointer-events: none;">Continue</button>
        </div>
      `;
    } else if (step === 9) { // Disclaimer
      container.innerHTML = `
        <h1 class="mb-4">Before you begin...</h1>
        <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">DOMINION is not easy. It will ask something of you every day. Some days you will fail. That's part of it. What matters is that you come back.</p>
        <div class="flex gap-2 mt-auto">
          <button id="btn-back-step" class="btn btn-ghost" style="flex:1;">Back</button>
          <button id="btn-next" class="btn btn-primary" style="flex:2;">I'm ready. Let's begin.</button>
        </div>
      `;
    }

    mainContent.appendChild(container);

    // Logic Handlers
    const bindSingleSelect = (fieldKey) => {
      const btnNext = document.getElementById('btn-next');
      document.getElementById('btn-back-step').addEventListener('click', () => { step--; updateStep(); });
      document.querySelectorAll('.selectable').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('.selectable').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
          
          if (fieldKey === 'battles') {
            data[fieldKey] = [el.dataset.val];
          } else {
            data[fieldKey] = el.dataset.val;
          }
          
          btnNext.style.opacity = '1';
          btnNext.style.pointerEvents = 'auto';
        });
      });
      btnNext.addEventListener('click', () => { step++; updateStep(); });
    };

    if (step === 1) {
      const btnNext = document.getElementById('btn-next');
      btnNext.style.pointerEvents = 'none';
      setTimeout(() => { if (btnNext) btnNext.style.pointerEvents = 'auto'; }, 3100);
      btnNext.addEventListener('click', () => { step++; updateStep(); });
    } else if (step === 2) { // Age
      bindSingleSelect('age');
    } else if (step === 3) { // Country
      const input = document.getElementById('country-input');
      const listContainer = document.getElementById('country-autocomplete-list');
      const btnNext = document.getElementById('btn-next');
      document.getElementById('btn-back-step').addEventListener('click', () => { step--; updateStep(); });
      
      const checkValid = () => {
        if (input.value.trim().length >= 2) {
          btnNext.style.opacity = '1';
          btnNext.style.pointerEvents = 'auto';
        } else {
          btnNext.style.opacity = '0.5';
          btnNext.style.pointerEvents = 'none';
        }
      };

      input.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        listContainer.innerHTML = '';
        if (!val || val.length < 1) {
          listContainer.classList.remove('active');
          checkValid();
          return;
        }
        
        const matches = GLOBAL_COUNTRIES.filter(c => c.toLowerCase().includes(val));
        if (matches.length > 0) {
          listContainer.classList.add('active');
          matches.slice(0, 8).forEach(match => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            const regex = new RegExp(`(${val})`, "gi");
            item.innerHTML = match.replace(regex, `<span style="color:var(--primary-accent);">$1</span>`);
            item.addEventListener('click', () => {
              input.value = match;
              listContainer.classList.remove('active');
              checkValid();
            });
            listContainer.appendChild(item);
          });
        } else {
          listContainer.classList.remove('active');
        }
        checkValid();
      });

      // Hide autocomplete if clicked outside
      document.addEventListener('click', (e) => {
        if (e.target !== input) {
          listContainer.classList.remove('active');
        }
      });

      btnNext.addEventListener('click', () => { 
        data.country = input.value.trim();
        step++; 
        updateStep(); 
      });
    } else if (step === 4) { // Relationship
      bindSingleSelect('relationship');
    } else if (step === 5) { // Battles
      bindSingleSelect('battles');
    } else if (step === 6) { // Frequency
      bindSingleSelect('frequency');
    } else if (step === 7) { // Feelings (Multi Select)
        const btnNext = document.getElementById('btn-next');
        document.getElementById('btn-back-step').addEventListener('click', () => { step--; updateStep(); });
        document.querySelectorAll('.selectable-multi').forEach(el => {
          el.addEventListener('click', () => {
            el.classList.toggle('selected');
            const val = el.dataset.val;
            if (data.feelings.includes(val)) {
              data.feelings.splice(data.feelings.indexOf(val), 1);
            } else {
              data.feelings.push(val);
            }
            if (data.feelings.length > 0) {
              btnNext.style.opacity = '1';
              btnNext.style.pointerEvents = 'auto';
            } else {
              btnNext.style.opacity = '0.5';
              btnNext.style.pointerEvents = 'none';
            }
          });
        });
        btnNext.addEventListener('click', () => { step++; updateStep(); });
    } else if (step === 8) { // Why
      const whyInput = document.getElementById('why-input');
      const btnNext = document.getElementById('btn-next');
      document.getElementById('btn-back-step').addEventListener('click', () => { step--; updateStep(); });
      
      whyInput.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
          btnNext.style.opacity = '1';
          btnNext.style.pointerEvents = 'auto';
        } else {
          btnNext.style.opacity = '0.5';
          btnNext.style.pointerEvents = 'none';
        }
      });
      btnNext.addEventListener('click', () => {
        data.why = whyInput.value.trim();
        step++; updateStep();
      });
    } else if (step === 9) { // Acceptance
      document.getElementById('btn-back-step').addEventListener('click', () => { step--; updateStep(); });
      document.getElementById('btn-next').addEventListener('click', () => {
        appState.age = data.age;
        appState.country = data.country;
        appState.relationship = data.relationship;
        appState.battles = data.battles;
        appState.frequency = data.frequency;
        appState.feelings = data.feelings;
        appState.why = data.why;
        // Do NOT trigger isFirstLaunch override here yet, rely on welcome screen.
        saveState();
        navigateTo('welcome');
      });
    }
  };

  updateStep();
}

// Helper Date Utils
function getTodayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// 3. Home
function renderHome() {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const todayStr = getTodayStr();
  const isMissionDone = !!appState.missionsCompleted[todayStr];
  let currentMissionDay = Object.keys(appState.missionsCompleted).length + 1;
  const mission = MISSIONS[(currentMissionDay - 1) % MISSIONS.length];
  
  const motivation = MOTIVATIONS[currentMissionDay % MOTIVATIONS.length];

  mainContent.innerHTML = `
    <div class="screen text-center">
      <p class="mb-2">${greeting}, Warrior.</p>
      <div class="streak-large text-light">Day ${appState.currentStreak}</div>
      <p class="mb-4">${motivation}</p>
      
      <div class="card text-left mt-4">
        <span class="card-label">TODAY'S MISSION</span>
        <h3 class="mt-2">${isMissionDone ? 'Mission Complete' : mission.title}</h3>
        <p class="mb-4">${isMissionDone ? 'You have held the line today. Return tomorrow.' : mission.text.substring(0, 60) + '...'}</p>
        
        <div class="flex items-center justify-between mt-4">
          <span style="font-size: 0.8rem; color: var(--text-muted)">${currentMissionDay} of 90 missions</span>
        </div>
        <div class="progress-bar-bg mb-4">
          <div class="progress-bar-fill" style="width: ${(currentMissionDay / 90) * 100}%"></div>
        </div>

        ${!isMissionDone ? `<button class="btn btn-primary" id="btn-start-mission">Start Mission</button>` : `<button class="btn btn-ghost disabled">Completed</button>`}
      </div>

      <button class="btn btn-danger mt-auto mb-4" id="btn-sos" style="display:flex; flex-direction:column; align-items:center;">
        <span style="font-size: 1.25rem; font-weight: 700; display:flex; align-items:center; gap:0.5rem;"><i data-feather="shield"></i>I'm Struggling Right Now</span>
        <span style="font-size: 0.8rem; font-weight: 400; opacity: 0.8; margin-top: 0.2rem;">Tap for immediate support</span>
      </button>
    </div>
  `;

  if (!isMissionDone) {
    document.getElementById('btn-start-mission').addEventListener('click', () => {
      navigateTo('mission_active', { day: currentMissionDay });
    });
  }

  document.getElementById('btn-sos').addEventListener('click', () => {
    navigateTo('sos');
  });
}

// 4. Mission Flow
function renderMissionList() {
  navigateTo('home'); // For MVP, mission tab just goes to home, or lists it. Let's redirect to home.
}

function renderMissionActive(dayNumber) {
  const mission = MISSIONS[(dayNumber - 1) % MISSIONS.length];
  
  mainContent.innerHTML = `
    <div class="screen text-left">
      <div class="flex items-center mb-4" style="gap: 1rem;">
        <button id="btn-back" class="icon-btn"><i data-feather="arrow-left"></i></button>
        <div>
          <span class="card-label mb-0" style="margin:0;">TODAY'S MISSION</span>
          <p style="font-size:0.8rem; margin:0;">Day ${dayNumber} of 90</p>
        </div>
      </div>

      <h1 class="mb-4">${mission.title}</h1>
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 1.5rem; color: var(--text-white); font-weight:300;">
        ${mission.text}
      </p>

      <div class="card mt-4 mb-4" style="background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.3);">
        <p class="text-orange" style="font-weight: 500;">What will you choose today?</p>
      </div>

      <div class="mt-auto">
        <button class="btn btn-primary" id="btn-complete">I completed this mission</button>
        <button class="btn btn-ghost" id="btn-later">Come back later</button>
      </div>
    </div>
  `;

  document.getElementById('btn-back').addEventListener('click', () => navigateTo('home'));
  document.getElementById('btn-later').addEventListener('click', () => navigateTo('home'));
  
  document.getElementById('btn-complete').addEventListener('click', () => {
    const todayStr = getTodayStr();
    appState.missionsCompleted[todayStr] = true;
    appState.currentStreak += 1;
    if (appState.currentStreak > appState.bestStreak) {
      appState.bestStreak = appState.currentStreak;
    }
    saveState();
    
    // Success Animation View
    mainContent.innerHTML = `
      <div class="screen justify-center text-center" style="background-color: var(--success-color); color: #000; animation: fadeIn 0.5s ease;">
        <div style="font-size: 5rem; margin-bottom: 2rem;"><i data-feather="check-circle" style="width:100px; height:100px;"></i></div>
        <h1 style="color: #000;">Mission complete.</h1>
        <p style="color: rgba(0,0,0,0.7); font-weight: 500; font-size:1.2rem;">One more day of Dominion.</p>
      </div>
    `;
    feather.replace();
    
    setTimeout(() => {
      navigateTo('home');
    }, 2500);
  });
}

// 5. SOS Flow
function renderSOSFlow() {
  let step = 1;
  const triggerData = {};

  const executeStep = () => {
    mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'screen flex-col';

    if (step === 1) { // Breathe
      container.innerHTML = `
        <div class="flex-col items-center justify-center" style="flex:1;">
          <div class="breathing-circle"></div>
          <h2 class="text-center mt-4">Breathe.</h2>
          <p class="text-center text-orange">You are stronger than this moment.</p>
          <p class="text-center mt-4" style="font-size: 0.9rem;">Inhale 4s — Hold 4s — Exhale 4s</p>
          <div class="mt-4 text-center text-light" style="font-size: 2rem;" id="timer">30</div>
        </div>
        <button class="btn btn-ghost mt-auto" id="btn-skip">Skip</button>
      `;
      mainContent.appendChild(container);
      
      let timeLeft = 30;
      const timerEl = document.getElementById('timer');
      const interval = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(interval);
          step++; executeStep();
        }
      }, 1000);

      document.getElementById('btn-skip').addEventListener('click', () => {
        clearInterval(interval);
        step++; executeStep();
      });
      return; // Early return to avoid appendChild duplicate
    }
    
    if (step === 2) { // Why context
      const scrip = SOS_SCRIPTURES[Math.floor(Math.random() * SOS_SCRIPTURES.length)];
      container.innerHTML = `
        <div class="flex-col items-center justify-center" style="flex:1;">
          <h2 class="text-orange mb-2 text-center">Your Why</h2>
          <h1 class="text-center mb-4" style="font-size:2rem; line-height:1.2;">"${appState.why}"</h1>
          <p class="text-center mt-4 mb-4 text-muted">This is why you started. This is why you keep going.</p>
          
          <div class="card mt-4 text-center">
            <p style="font-style:italic;">${scrip}</p>
          </div>
        </div>
        <button class="btn btn-primary mt-auto" id="btn-rem">I remember why</button>
      `;
      mainContent.appendChild(container);
      document.getElementById('btn-rem').addEventListener('click', () => { step++; executeStep(); });
      return;
    }

    if (step === 3) { // Actions
      // Shuffle array
      const shuffled = [...SOS_ACTIONS].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      container.innerHTML = `
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
          <h1 class="text-center mb-4">Do one of these<br>right now.</h1>
          ${selected.map((act, i) => `
            <div class="card" style="display:flex; align-items:center; gap:1rem; margin-bottom:1rem;">
              <div style="width:30px; height:30px; border-radius:15px; background:var(--primary-accent); display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold;">${i+1}</div>
              <p style="margin:0; color:var(--text-white); font-weight:500;">${act}</p>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-primary mt-auto" id="btn-held">I did it. I held the line.</button>
      `;
      mainContent.appendChild(container);
      document.getElementById('btn-held').addEventListener('click', () => { step++; executeStep(); });
      return;
    }

    if (step === 4) { // Log
      container.innerHTML = `
        <h1 class="mb-2">What triggered this?</h1>
        <p class="mb-4">Logging helps you recognize patterns later.</p>
        
        <div class="calendar-grid mb-4">
          <div class="card text-center selectable" style="padding:1rem 0.5rem;" data-trigger="Loneliness">😔 Loneliness</div>
          <div class="card text-center selectable" style="padding:1rem 0.5rem;" data-trigger="Stress">😤 Stress</div>
          <div class="card text-center selectable" style="padding:1rem 0.5rem;" data-trigger="Boredom">😴 Boredom</div>
          <div class="card text-center selectable" style="padding:1rem 0.5rem;" data-trigger="Frustration">😠 Frustration</div>
        </div>
        
        <p class="text-muted mb-2 text-center" style="grid-column: span 4;">Optional</p>
        <input type="text" id="trigger-extra" placeholder="Anything else?">
        
        <div class="mt-auto">
          <button class="btn btn-primary" id="btn-save" style="margin-bottom:0.5rem; opacity:0.5; pointer-events:none;">Save</button>
          <button class="btn btn-ghost" id="btn-logs-skip">Skip</button>
        </div>
      `;
      mainContent.appendChild(container);
      
      const btnSave = document.getElementById('btn-save');
      document.querySelectorAll('.selectable').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('.selectable').forEach(x => x.classList.remove('selected'));
          el.classList.add('selected');
          triggerData.trigger = el.dataset.trigger;
          btnSave.style.opacity = '1';
          btnSave.style.pointerEvents = 'auto';
        });
      });

      const finishAndSave = () => {
        appState.sosUsage.push({
          date: new Date().toISOString(),
          trigger: triggerData.trigger || "Skipped",
          extra: document.getElementById('trigger-extra').value || ""
        });
        saveState();
        navigateTo('home');
      };

      document.getElementById('btn-save').addEventListener('click', finishAndSave);
      document.getElementById('btn-logs-skip').addEventListener('click', finishAndSave);
      return;
    }
  };

  executeStep();
}

// 6. Journey Screen
function renderJourney() {
  const d = new Date(appState.startDate || new Date());
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  
  // Create a minimal 30 day visualization
  const daysInMonth = 30;
  let calendarHtml = '';
  for(let i = 1; i <= daysInMonth; i++) {
    // Determine status (mocked for demo if no real data based on logic)
    let cls = 'calendar-day';
    // For effect, color the current streak
    if (i <= appState.currentStreak) cls += ' success';
    calendarHtml += `<div class="${cls}">${i}</div>`;
  }

  mainContent.innerHTML = `
    <div class="screen text-center flex-col">
      <h2 class="mb-4 text-left">Your Journey</h2>
      
      <div class="card">
        <div class="streak-large">${appState.currentStreak}</div>
        <p style="font-weight:500; font-size:1.2rem; color:var(--text-white)">Days Strong</p>
        <p class="text-muted mt-2">Best: ${appState.bestStreak} days</p>
        <p class="text-muted">Started: ${d.toLocaleDateString('en-US', options)}</p>
      </div>
      
      <div class="card text-left mt-2">
        <span class="card-label">THIS MONTH</span>
        <div class="calendar-grid">
          ${calendarHtml}
        </div>
      </div>

      <div class="card text-left mt-2">
        <span class="card-label">SOS INSIGHTS</span>
        <p style="margin-bottom:0.5rem;">You've used the SOS button <strong>${appState.sosUsage.length}</strong> times.</p>
        ${appState.sosUsage.length > 0 ? 
          `<p class="text-orange" style="font-size:0.9rem;">Most common trigger: ${appState.sosUsage[appState.sosUsage.length-1].trigger}</p>` : 
          `<p class="text-muted" style="font-size:0.9rem;">No triggers logged yet.</p>`}
      </div>

      <button class="btn btn-ghost mt-auto mb-2" id="btn-relapse" style="font-size: 0.9rem;">I relapsed</button>
    </div>
  `;

  document.getElementById('btn-relapse').addEventListener('click', () => {
    mainContent.innerHTML = `
      <div class="screen text-center flex-col justify-center">
        <h1 class="mb-2">This is part of the journey.</h1>
        <p class="mb-4 text-muted">Not the end of it.</p>
        
        <div class="card text-center mb-4">
          <p class="text-orange" style="font-size:0.9rem; text-transform:uppercase; font-weight:700;">Streak Reset</p>
          <div class="streak-large" style="color:var(--text-white);">${appState.currentStreak}</div>
          <p>days recorded in history.</p>
        </div>

        <button class="btn btn-primary mt-auto" id="btn-confirm-relapse">Start Day 1</button>
        <button class="btn btn-ghost mt-2" id="btn-cancel-relapse">Cancel</button>
      </div>
    `;

    document.getElementById('btn-cancel-relapse').addEventListener('click', () => renderJourney());
    document.getElementById('btn-confirm-relapse').addEventListener('click', () => {
      appState.relapses.push({
        date: new Date().toISOString(),
        streakLost: appState.currentStreak
      });
      appState.currentStreak = 0;
      saveState();
      
      mainContent.innerHTML = `
        <div class="screen flex-col items-center justify-center text-center">
          <div class="streak-large">0</div>
          <p class="mt-4">Day 1 again.<br>The fact that you're here means you haven't quit.</p>
        </div>
      `;
      setTimeout(() => navigateTo('home'), 3000);
    });
  });
}

// 7. Settings
function renderSettings() {
  mainContent.innerHTML = `
    <div class="screen">
      <h2 class="mb-4">Settings</h2>

      <div class="card text-left mb-2">
        <span class="card-label">Anonymous User ID</span>
        <p style="font-family: monospace; font-size: 1.1rem; color: var(--text-white);">${appState.userId}</p>
      </div>
      
      <div class="card text-left mb-2">
        <span class="card-label">Your Demographics</span>
        <p style="font-size:0.9rem; color:var(--text-white)"><strong>Age:</strong> ${appState.age || 'Unknown'}</p>
        <p style="font-size:0.9rem; color:var(--text-white)"><strong>Status:</strong> ${appState.relationship || 'Unknown'}</p>
        <p style="font-size:0.9rem; color:var(--text-white)"><strong>Country:</strong> ${appState.country || 'Unknown'}</p>
      </div>

      <div class="card text-left mb-2">
        <span class="card-label">Your Battle</span>
        <p style="font-size:0.9rem; color:var(--text-white)"><strong>Focus:</strong> ${appState.battles.join(' & ') || 'Not set'}</p>
        <p style="font-size:0.9rem; color:var(--text-white)"><strong>Frequency:</strong> ${appState.frequency || 'Unknown'}</p>
      </div>

      <div class="card text-left mb-2">
        <span class="card-label">Your Why</span>
        <p style="font-style:italic;">"${appState.why || 'Not set'}"</p>
      </div>

      <div class="card text-left mb-4">
        <span class="card-label">Notifications</span>
        <div class="flex items-center justify-between" style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
          <p style="color:var(--text-white)">Daily Reminders</p>
          <button class="icon-btn" style="color:var(--primary-accent)"><i data-feather="toggle-right"></i></button>
        </div>
        <div class="flex items-center justify-between">
          <p style="color:var(--text-white)">Time</p>
          <p class="text-orange" style="font-weight:500;">08:00 AM</p>
        </div>
      </div>

      <div class="card text-left text-muted" style="font-size:0.8rem; line-height: 1.4;">
        <span class="card-label" style="color:var(--text-secondary)">LEGAL DISCLAIMER</span>
        DOMINION is a wellness and accountability app, not a medical or clinical service. It does not diagnose, treat, or replace professional care. If you are struggling with a serious condition, please consult a qualified professional.
      </div>
      
      <button class="btn btn-ghost mt-4 mb-4" id="btn-reset-test" style="border-color: var(--danger-color); color: var(--danger-color);">Reset Progress (Testing)</button>
      
      <p class="text-center text-muted" style="font-size:0.8rem; margin-top:1rem;">App Version: 1.0.0 (MVP)</p>
    </div>
  `;

  // Attach event listener
  document.getElementById('btn-reset-test').addEventListener('click', () => {
    const currentUserId = appState.userId;
    appState = { ...defaultState };
    appState.userId = currentUserId; // preserve testing ID
    appState.isFirstLaunch = true;
    saveState();
    navigateTo('onboarding');
  });
}

// Boot up
navigateTo('splash');

// ===============================
// 8. Welcome Cinematic
// ===============================
function renderWelcome() {
  mainContent.innerHTML = `
    <div class="screen text-center flex-col justify-center items-center" style="background:#090808; padding: 2rem;">
      
      <p class="anim-fade-up" style="font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; color: #f97316; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 2rem; animation-delay: 0ms;">DOMINION</p>
      
      <h1 class="anim-fade-up" style="font-family: 'Syne', sans-serif; font-weight: 700; font-size: 32px; color: #faf7f4; margin-bottom: 2rem; line-height: 1.2; animation-delay: 800ms;">It takes courage to be here.</h1>
      
      <p class="anim-fade-up" style="font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 16px; color: #a89890; line-height: 1.9; margin-bottom: 2rem; animation-delay: 1400ms;">
        Most men never make it this far.<br>
        They live with it in silence.<br>
        You chose differently.
      </p>

      <p class="anim-fade-up" style="font-family: 'DM Sans', sans-serif; font-weight: 400; font-size: 18px; color: #faf7f4; margin-bottom: 3rem; animation-delay: 2000ms;">This is where the real change begins.</p>
      
      <p class="anim-fade-up" style="font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; color: #f97316; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 2rem; animation-delay: 2800ms;">YOUR JOURNEY STARTS NOW</p>

      <button id="btn-enter" class="anim-fade-up" style="width: 100%; background: #f97316; color: #000; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 15px; letter-spacing: 2px; border-radius: 8px; padding: 18px; border: none; cursor: pointer; animation-delay: 3400ms;">Enter DOMINION</button>

    </div>
  `;

  const btnEnter = document.getElementById('btn-enter');
  
  // Protect against skipping via JS fallback as required
  btnEnter.style.pointerEvents = 'none';
  setTimeout(() => { 
    if(btnEnter) btnEnter.style.pointerEvents = 'auto'; 
  }, 3400);

  btnEnter.addEventListener('click', () => {
    appState.isFirstLaunch = false;
    appState.startDate = new Date().toISOString();
    saveState();
    navigateTo('home');
  });
}
