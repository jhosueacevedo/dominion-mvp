// ===============================
// STATE MANAGEMENT & LOCAL STORAGE
// ===============================
const STORAGE_KEY = 'dominion_data';

const defaultState = {
  isFirstLaunch: true,
  battles: [], // 'pornography', 'masturbation', 'ambas'
  country: null,
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
  if (['splash', 'onboarding', 'sos', 'mission_active'].includes(screen)) {
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
  const selections = [];

  const updateStep = () => {
    mainContent.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'screen justify-center';
    
    if (step === 1) {
      container.innerHTML = `
        <h1 class="text-center">Your Life.<br>Your Purpose.<br>Your Dominion.</h1>
        <p class="text-center mt-4 mb-4">A daily system built to help you become who you were always called to be.</p>
        <button id="btn-next" class="btn btn-primary mt-auto">Get Started</button>
      `;
    } else if (step === 2) {
      container.innerHTML = `
        <h1 class="mb-2">What are you fighting?</h1>
        <p class="mb-4">Be honest. This personalizes your entire experience.</p>
        
        <div class="card selectable" data-val="Pornography">
          <h3 class="mb-1">🔴 Pornography</h3>
        </div>
        <div class="card selectable" data-val="Masturbation">
          <h3 class="mb-1">🔴 Masturbation</h3>
        </div>
        <div class="card selectable" data-val="Ambas">
          <h3 class="mb-1">🔴 Ambas</h3>
        </div>
        
        <button id="btn-next" class="btn btn-primary mt-auto" style="opacity: 0.5; pointer-events: none;">This is my battle</button>
      `;
    } else if (step === 3) {
      container.innerHTML = `
        <h1 class="mb-2">Where are you fighting from?</h1>
        <p class="mb-4">Select your country to stand with warriors globally.</p>
        
        <select id="country-select" style="width: 100%; padding: 1rem; border-radius: 8px; font-size: 1rem; background: var(--surface-color); color: var(--text-white); border: 1px solid var(--border-color); margin-bottom: 2rem;">
          <option value="" disabled selected>Select a country...</option>
          <option value="🇺🇸 United States">United States</option>
          <option value="🇲🇽 Mexico">México</option>
          <option value="🇨🇴 Colombia">Colombia</option>
          <option value="🇦🇷 Argentina">Argentina</option>
          <option value="🇪🇸 Spain">España</option>
          <option value="🇨🇱 Chile">Chile</option>
          <option value="🇵🇪 Peru">Perú</option>
          <option value="🌎 Other">Other</option>
        </select>

        <div id="country-emoji" style="font-size: 5rem; text-align: center; margin-bottom: 2rem; min-height: 80px;"></div>

        <button id="btn-next" class="btn btn-primary mt-auto" style="opacity: 0.5; pointer-events: none;">Continue</button>
      `;
    } else if (step === 4) {
      container.innerHTML = `
        <h1 class="mb-2">Why do you want to change?</h1>
        <p class="mb-4">Your reason is your anchor. It will appear when you need it most.</p>
        
        <textarea id="why-input" rows="4" placeholder="Write your reason here..." maxlength="140"></textarea>
        
        <button id="btn-next" class="btn btn-primary mt-auto" style="opacity: 0.5; pointer-events: none;">This is my why</button>
      `;
    }

    mainContent.appendChild(container);

    // Step Logic
    if (step === 1) {
      document.getElementById('btn-next').addEventListener('click', () => { step++; updateStep(); });
    } else if (step === 2) {
      const btnNext = document.getElementById('btn-next');
      document.querySelectorAll('.selectable').forEach(el => {
        el.addEventListener('click', () => {
          el.classList.toggle('selected');
          const val = el.dataset.val;
          if (selections.includes(val)) {
            selections.splice(selections.indexOf(val), 1);
          } else {
            selections.push(val);
          }
          if (selections.length > 0) {
            btnNext.style.opacity = '1';
            btnNext.style.pointerEvents = 'auto';
          } else {
            btnNext.style.opacity = '0.5';
            btnNext.style.pointerEvents = 'none';
          }
        });
      });
      btnNext.addEventListener('click', () => { step++; updateStep(); });
    } else if (step === 3) {
      const select = document.getElementById('country-select');
      const btnNext = document.getElementById('btn-next');
      const emojiDiv = document.getElementById('country-emoji');
      
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          btnNext.style.opacity = '1';
          btnNext.style.pointerEvents = 'auto';
          // Extract emoji (first 2 chars normally for flags)
          emojiDiv.innerText = e.target.value.substring(0, 2).trim(); 
        }
      });

      btnNext.addEventListener('click', () => { 
        appState.country = select.value;
        step++; 
        updateStep(); 
      });
    } else if (step === 4) {
      const whyInput = document.getElementById('why-input');
      const btnNext = document.getElementById('btn-next');
      
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
        appState.battles = selections;
        appState.why = whyInput.value.trim();
        appState.isFirstLaunch = false;
        appState.startDate = new Date().toISOString();
        saveState();
        navigateTo('home');
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
        <span class="card-label">Your Battle</span>
        <p>${appState.battles.join(' & ') || 'Not set'}</p>
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
      
      <p class="text-center text-muted" style="font-size:0.8rem; margin-top:1rem;">App Version: 1.0.0 (MVP)</p>
    </div>
  `;
}

// Boot up
navigateTo('splash');
