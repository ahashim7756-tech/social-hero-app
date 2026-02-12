let missions = [];
let currentMissionIndex = 0;
let socialPoints = 0;
let language = 'en';

const missionTitle = document.getElementById('mission-title');
const missionGoal = document.getElementById('mission-goal');
const pushTalkBtn = document.getElementById('push-talk');
const responseDiv = document.getElementById('response');
const socialPointsDiv = document.getElementById('social-points');
const worldButtons = document.querySelectorAll('.world-btn');

const enBtn = document.getElementById('en-btn');
const arBtn = document.getElementById('ar-btn');

function loadMission(index) {
  const mission = missions[index];
  if (!mission) return;
  missionTitle.textContent = language === 'ar' ? mission.title_ar : mission.title;
  missionGoal.textContent = language === 'ar' ? mission.goal_ar : mission.goal_description;
  responseDiv.textContent = '';
}

function changeLanguage(lang) {
  language = lang;
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (missions[currentMissionIndex]) loadMission(currentMissionIndex);
}

enBtn.onclick = () => changeLanguage('en');
arBtn.onclick = () => changeLanguage('ar');

worldButtons.forEach(btn => {
  btn.onclick = () => {
    document.getElementById('mission-screen').style.display = 'block';
    loadMission(currentMissionIndex);
  };
});

pushTalkBtn.onclick = () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support Speech Recognition.');
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    const speech = event.results[0][0].transcript;
    // Simulate sending to Gemini API
    const mission = missions[currentMissionIndex];
    const success = Math.random() > 0.3; // dummy success
    const points = success ? Math.floor(Math.random() * 10) + 1 : 0;
    socialPoints += points;

    responseDiv.textContent = `🗣️ ${mission.character_name}: ${success ? 'Well done!' : 'Try again!'}`;
    socialPointsDiv.textContent = `Social Points: ${socialPoints}`;

    currentMissionIndex++;
    if (currentMissionIndex < missions.length) loadMission(currentMissionIndex);
    else missionTitle.textContent = language === 'ar' ? 'لقد أكملت كل المهام!' : 'All missions completed!';
  };
};

fetch('missions.json')
  .then(res => res.json())
  .then(data => {
    missions = data;
    loadMission(currentMissionIndex);
  });

