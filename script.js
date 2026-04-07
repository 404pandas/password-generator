// ============================================================
//  Password Generator
//  Uses crypto.getRandomValues() for cryptographic randomness
//  Animations powered by GSAP
// ============================================================

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers:   "0123456789",
  special:   "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

const STRENGTH_COLORS = {
  0: "#1e1e32",
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
};

const STRENGTH_LABELS = ["—", "Weak", "Fair", "Good", "Strong"];

// DOM references
const passwordEl    = document.getElementById("password");
const copyBtn       = document.getElementById("copy-btn");
const generateBtn   = document.getElementById("generate-btn");
const lengthSlider  = document.getElementById("length-slider");
const lengthDisplay = document.getElementById("length-display");
const strengthBars  = document.querySelector(".strength-bars");
const strengthLabel = document.getElementById("strength-label");
const bars          = gsap.utils.toArray(".bar");

const checkboxes = {
  uppercase: document.getElementById("include-uppercase"),
  lowercase: document.getElementById("include-lowercase"),
  numbers:   document.getElementById("include-numbers"),
  special:   document.getElementById("include-special"),
};

// Current password in memory (never leaves the page)
let currentPassword  = "";
let scrambleTween    = null;

// ============================================================
//  Page load intro
// ============================================================
(function intro() {
  gsap.set(["header h1", ".subtitle", ".card"], { autoAlpha: 0, y: 24 });

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .to("header h1",  { autoAlpha: 1, y: 0, duration: 0.7 })
    .to(".subtitle",  { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.4")
    .to(".card",      { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3");
})();

// ============================================================
//  Cryptographic random integer in [0, max)
// ============================================================
function cryptoRandInt(max) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  // Reject values that would introduce modulo bias
  const limit = 2 ** 32 - (2 ** 32 % max);
  while (arr[0] >= limit) crypto.getRandomValues(arr);
  return arr[0] % max;
}

// ============================================================
//  Fisher-Yates shuffle using crypto randomness
// ============================================================
function cryptoShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================
//  Build active character pool from selected options
// ============================================================
function buildCharPool() {
  return Object.entries(checkboxes)
    .filter(([, el]) => el.checked)
    .map(([key]) => CHAR_SETS[key]);
}

// ============================================================
//  Generate password
//  - Guarantees at least one character from each selected type
//  - Fills the remainder from the full pool
//  - Shuffles to prevent predictable placement of guaranteed chars
// ============================================================
function generatePassword(length, charPools) {
  const fullPool = charPools.join("");
  const chars    = charPools.map((pool) => pool[cryptoRandInt(pool.length)]);
  while (chars.length < length) {
    chars.push(fullPool[cryptoRandInt(fullPool.length)]);
  }
  return cryptoShuffle(chars).join("");
}

// ============================================================
//  Password strength score  0 = none | 1–4 = Weak → Strong
// ============================================================
function getStrength(password, charPools) {
  if (!password) return 0;
  let score = charPools.length;           // +1 per character type
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (password.length >= 32) score++;
  return Math.min(score, 4);
}

// ============================================================
//  GSAP: Scramble animation for new passwords
// ============================================================
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function animatePassword(finalText) {
  // Kill any in-progress scramble
  if (scrambleTween) scrambleTween.kill();

  passwordEl.classList.remove("placeholder");

  const obj = { progress: 0 };

  scrambleTween = gsap.to(obj, {
    progress: 1,
    duration: 0.55,
    ease: "none",
    onUpdate() {
      const revealed = Math.floor(obj.progress * finalText.length);
      passwordEl.textContent = finalText
        .split("")
        .map((char, i) =>
          i < revealed
            ? char
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
        )
        .join("");
    },
    onComplete() {
      passwordEl.textContent = finalText;
    },
  });
}

// ============================================================
//  GSAP: Strength bar update
// ============================================================
function updateStrength(password, charPools) {
  const score = getStrength(password, charPools);

  bars.forEach((bar, i) => {
    const isActive = i < score;
    gsap.to(bar, {
      backgroundColor: isActive ? STRENGTH_COLORS[score] : STRENGTH_COLORS[0],
      duration: 0.35,
      delay: isActive ? i * 0.07 : 0,
      ease: "power2.out",
    });
  });

  gsap.to(strengthLabel, {
    color: score > 0 ? STRENGTH_COLORS[score] : "#64748b",
    duration: 0.3,
  });

  strengthLabel.textContent = STRENGTH_LABELS[score];
  strengthBars.setAttribute("aria-valuenow", score);
}

// ============================================================
//  Update slider fill (progress track)
// ============================================================
function updateSliderFill() {
  const pct = ((lengthSlider.value - lengthSlider.min) /
               (lengthSlider.max  - lengthSlider.min)) * 100;
  lengthSlider.style.background =
    `linear-gradient(to right, #7c3aed ${pct}%, #1e1e32 ${pct}%)`;
}

// ============================================================
//  GSAP: Copy to clipboard with pop animation
// ============================================================
async function copyPassword() {
  if (!currentPassword) return;

  try {
    await navigator.clipboard.writeText(currentPassword);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = currentPassword;
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // Elastic pop + color swap
  gsap.fromTo(copyBtn,
    { scale: 0.75, rotation: -12 },
    { scale: 1, rotation: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" }
  );

  copyBtn.classList.add("copied");
  copyBtn.setAttribute("aria-label", "Copied!");

  setTimeout(() => {
    copyBtn.classList.remove("copied");
    copyBtn.setAttribute("aria-label", "Copy password to clipboard");
  }, 2000);
}

// ============================================================
//  GSAP: Shake the password row on invalid input
// ============================================================
function shakePasswordRow() {
  gsap.to(".password-row", {
    x: 7,
    duration: 0.07,
    repeat: 5,
    yoyo: true,
    ease: "none",
    onComplete: () => gsap.set(".password-row", { x: 0 }),
  });
}

// ============================================================
//  Main: handle generate
// ============================================================
function handleGenerate() {
  const charPools = buildCharPool();

  if (charPools.length === 0) {
    passwordEl.textContent = "Select at least one character type.";
    passwordEl.classList.add("placeholder");
    currentPassword = "";
    copyBtn.disabled = true;
    updateStrength("", []);
    shakePasswordRow();
    return;
  }

  const password  = generatePassword(Number(lengthSlider.value), charPools);
  currentPassword = password;
  copyBtn.disabled = false;

  animatePassword(password);
  updateStrength(password, charPools);
}

// ============================================================
//  Event listeners
// ============================================================
generateBtn.addEventListener("click", () => {
  // Elastic press on the button itself
  gsap.fromTo(generateBtn,
    { scale: 0.94 },
    { scale: 1, duration: 0.5, ease: "elastic.out(1.1, 0.5)" }
  );
  handleGenerate();
});

copyBtn.addEventListener("click", copyPassword);

lengthSlider.addEventListener("input", () => {
  lengthDisplay.textContent = lengthSlider.value;
  updateSliderFill();
  if (currentPassword) handleGenerate();
});

Object.values(checkboxes).forEach((el) => {
  el.addEventListener("change", () => {
    if (currentPassword) handleGenerate();
  });
});

// ============================================================
//  Init
// ============================================================
passwordEl.classList.add("placeholder");
updateSliderFill();
lengthDisplay.textContent = lengthSlider.value;
