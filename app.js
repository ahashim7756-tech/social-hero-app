let language = 'en';
let currentMissionIndex = -1;
let missions = [];

fetch('missions.json')
  .then(res => res.json())
  .then(data => missions = data)
  .catch(err => console.error("Error loading missions:", err));

const enBtn = document.getElementById('en-btn');
const arBtn = document.getElementById('ar-btn');
const worldsEls = document.querySelectorAll('.world');
const missionTitle = document.getElementById('mission-title');
const missionDesc = document.getElementById('mission-desc');
const characterName = document.getElementById('character-name');
const pushBtn = document.getElementById('push-to-talk');
const socialRank = document.getElementById('social-rank');

enBtn.onclick = () => switchLanguage('en');
arBtn.onclick = () => switchLanguage('ar');

function switchLanguage(lang) {
  language = lang;
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  refreshMissionDisplay();
}

worldsEls.forEach(el => {
  el.onclick = () => {
    const world = el.dataset.world;
    pickWorldMission(world);
  };
});

function pickWorldMission(world) {
  const foundIdx = missions.findIndex(m => m.category === world);
  if (foundIdx >= 0) {
    currentMissionIndex = foundIdx;
    refreshMissionDisplay();
  }
}

function refreshMissionDisplay() {
  if (currentMissionIndex < 0 || currentMissionIndex >= missions.length) return;
  const m = missions[currentMissionIndex];
  missionTitle.textContent = language === 'ar' ? m.title_ar : m.title;
  missionDesc.textContent = language === 'ar' ? m.goal_ar : m.goal_description;
  characterName.textContent = m.character_name;
}

pushBtn.onclick = () => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert("Speech Recognition not supported in this browser");
    return;
  }
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
  recognition.start();
  recognition.onresult = async event => {
    const speechText = event.results[0][0].transcript;
    const response = await callGemini(speechText);
    alert(`${response.message}\nSocial Points: ${response.social_points}`);
    updateRank(response.social_points);
  };
};

function updateRank(points) {
  socialRank.textContent = language === 'ar'
    ? `المستوى: ${getArabicRank(points)}`
    : `Rank: ${getEnglishRank(points)}`;
}

function getEnglishRank(p) {
  if (p < 50) return "Novice";
  if (p < 100) return "Scout";
  if (p < 200) return "Hero";
  return "Legend";
}
function getArabicRank(p) {
  if (p < 50) return "مبتدئ";
  if (p < 100) return "كشاف";
  if (p < 200) return "بطل";
  return "أسطورة";
}

async function callGemini(userText) {
  const m = missions[currentMissionIndex];
  const prompt = `
You are the Social Hero Engine. You receive a Kid's voice input and the current Mission Goal.
Analyze if the response is Polite, Socially Intelligent, and helps achieve the goal.
Respond as the character in the mission.
Return JSON like { "message": "...", "success": true/false, "social_points": 0-10 }.
  `;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer AIzaSyCY50zXYFidauFLWpzoEoIlozhLRU6WkvU`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: `Kid said: "${userText}"` }
        ],
        temperature: 0.7
      })
    });
    const d = await res.json();
    return JSON.parse(d.choices[0].message.content);
  } catch (e) {
    console.error("Gemini error", e);
    return { message:"Error", success:false, social_points:0 };
  }
}
