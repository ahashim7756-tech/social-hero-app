let language = "en"; // default English

const languageToggle = document.getElementById("language-toggle");
const pushButton = document.getElementById("push-to-talk");
const responseText = document.getElementById("response-text");
const missionText = document.getElementById("mission-text");
const socialRank = document.getElementById("social-rank");
const body = document.body;

languageToggle.addEventListener("click", () => {
  language = language === "en" ? "ar" : "en";
  body.classList.toggle("rtl");
  updateMissionText();
});

let currentMissionIndex = 0;
let missions = [];

// Load missions.json
fetch("missions.json")
  .then((res) => res.json())
  .then((data) => {
    missions = data;
    updateMissionText();
  });

function updateMissionText() {
  if (missions.length === 0) return;
  const mission = missions[currentMissionIndex];
  missionText.textContent =
    language === "en" ? mission.title : mission.title_ar;
}

// Voice recognition
pushButton.addEventListener("click", () => {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = language === "en" ? "en-US" : "ar-SA";
  recognition.start();

  recognition.onresult = (event) => {
    const userSpeech = event.results[0][0].transcript;
    sendToGemini(userSpeech);
  };
});

function sendToGemini(text) {
  const mission = missions[currentMissionIndex];
  
  // Example API call (placeholder)
  responseText.textContent = "Processing...";

  fetch("https://api.gemini.fake/response", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_GEMINI_API_KEY"
    },
    body: JSON.stringify({
      language: language,
      mission_goal: language === "en" ? mission.goal_description : mission.goal_ar,
      user_input: text
    })
  })
    .then((res) => res.json())
    .then((data) => {
      responseText.textContent = data.message;
      if (data.success) {
        currentMissionIndex++;
        updateMissionText();
      }
      socialRank.textContent = `Rank: ${data.social_points}/10`;
    })
    .catch((err) => {
      responseText.textContent = "Error connecting to Gemini API";
      console.error(err);
    });
}
