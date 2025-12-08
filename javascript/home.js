const healthTips = [
  "Drink at least 8 glasses of water today for better energy.",
  "Take a 10-minute walk after meals to improve digestion.",
  "Sleep is when you heal. Aim for 7-9 hours tonight.",
  "Eat a rainbow! Add more colorful vegetables to your plate.",
  "Reduce screen time 1 hour before bed for better sleep.",
  "Stress check: Take 3 deep breaths right now.",
  "Vitamin D is crucial. Get 15 minutes of sunlight today."
];


function getNewTip() {
  
  const displayElement = document.getElementById("health-tip-display");

  const randomIndex = Math.floor(Math.random() * healthTips.length);

  displayElement.innerText = healthTips[randomIndex];
  
}

