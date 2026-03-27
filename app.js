const form = document.querySelector("#risk-form");
const sampleButton = document.querySelector("#sample-button");
const formMessage = document.querySelector("#form-message");

const fields = {
  population: document.querySelector("#population"),
  acuteCare: document.querySelector("#acute-care"),
  longTermCare: document.querySelector("#long-term-care"),
  labIsolates: document.querySelector("#lab-isolates"),
  timeFrame: document.querySelector("#time-frame")
};

const ui = {
  title: document.querySelector("#risk-title"),
  summary: document.querySelector("#risk-summary"),
  score: document.querySelector("#risk-score"),
  tier: document.querySelector("#risk-tier"),
  guidance: document.querySelector("#risk-guidance"),
  scoreRing: document.querySelector("#score-ring"),
  metricPopulation: document.querySelector("#metric-population"),
  metricFacility: document.querySelector("#metric-facility"),
  metricSurveillance: document.querySelector("#metric-surveillance"),
  metricTime: document.querySelector("#metric-time"),
  drivers: document.querySelector("#driver-list"),
  actions: document.querySelector("#action-list")
};

const timeframeMultipliers = {
  monthly: 1.12,
  quarterly: 1,
  annual: 0.9
};

const recommendations = {
  elevated: [
    "Increase case review cadence with acute and long-term care partners.",
    "Validate staffing resilience and confirm escalation contacts across facilities.",
    "Review isolate collection throughput to ensure sustained surveillance coverage."
  ],
  moderate: [
    "Maintain weekly cross-facility surveillance review.",
    "Track facility occupancy shifts and watch for sudden isolate spikes.",
    "Prepare contingency communications for vulnerable care settings."
  ],
  low: [
    "Continue routine monitoring and monthly reporting validation.",
    "Preserve baseline outreach with acute and long-term care operators.",
    "Spot-check isolate submission trends for early deviation signals."
  ]
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

function getTier(score) {
  if (score >= 70) {
    return {
      label: "Elevated Risk",
      color: "#a94231",
      key: "elevated",
      summary: "The network shows meaningful strain and should move into an elevated readiness posture."
    };
  }

  if (score >= 40) {
    return {
      label: "Moderate Risk",
      color: "#d88a2a",
      key: "moderate",
      summary: "Conditions are manageable, but the dashboard signals enough pressure to justify active monitoring."
    };
  }

  return {
    label: "Low Risk",
    color: "#3b7a57",
    key: "low",
    summary: "Current indicators remain relatively stable, with emphasis on steady surveillance and validation."
  };
}

function calculateAssessment({ population, acuteCare, longTermCare, labIsolates, timeFrame }) {
  const facilityPer10k = ((acuteCare + longTermCare) / Math.max(population, 1)) * 10000;
  const isolatesPer10k = (labIsolates / Math.max(population, 1)) * 10000;
  const populationPressure = clamp((population / 120000) * 100, 0, 100);
  const facilityLoad = clamp(facilityPer10k * 22, 0, 100);
  const surveillanceIntensity = clamp(isolatesPer10k * 28, 0, 100);
  const timeFactor = clamp(timeframeMultipliers[timeFrame] * 100 - 90, 0, 30);

  const baseScore =
    populationPressure * 0.4 +
    facilityLoad * 0.35 +
    surveillanceIntensity * 0.2 +
    timeFactor * 0.05;

  const finalScore = clamp(Math.round(baseScore * timeframeMultipliers[timeFrame]), 0, 100);
  const tier = getTier(finalScore);

  const driverMap = [
    { label: "Population pressure", value: populationPressure, detail: `Population footprint of ${population.toLocaleString()} residents.` },
    { label: "Facility load", value: facilityLoad, detail: `${acuteCare + longTermCare} combined facilities serving the region.` },
    { label: "Surveillance intensity", value: surveillanceIntensity, detail: `${labIsolates} lab isolates submitted in the selected period.` },
    { label: "Time factor", value: timeFactor, detail: `${timeFrame.charAt(0).toUpperCase()}${timeFrame.slice(1)} reporting window multiplier applied.` }
  ].sort((a, b) => b.value - a.value);

  return {
    finalScore,
    tier,
    populationPressure,
    facilityLoad,
    surveillanceIntensity,
    timeFactor,
    drivers: driverMap.slice(0, 3)
  };
}

function setList(target, items) {
  target.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    target.appendChild(li);
  });
}

function updateResults(result) {
  ui.title.textContent = result.tier.label;
  ui.summary.textContent = result.tier.summary;
  ui.score.textContent = `${result.finalScore}`;
  ui.tier.textContent = result.tier.label;
  ui.guidance.textContent = `This score reflects weighted population pressure, care-network load, surveillance intensity, and ${fields.timeFrame.value} reporting sensitivity.`;
  ui.metricPopulation.textContent = formatPercent(result.populationPressure);
  ui.metricFacility.textContent = formatPercent(result.facilityLoad);
  ui.metricSurveillance.textContent = formatPercent(result.surveillanceIntensity);
  ui.metricTime.textContent = formatPercent(result.timeFactor * (100 / 30));

  ui.scoreRing.style.background = `radial-gradient(circle at center, rgba(255, 251, 242, 0.98) 0 56%, transparent 57%), conic-gradient(${result.tier.color} ${result.finalScore * 3.6}deg, rgba(70, 92, 72, 0.14) 0deg)`;

  setList(
    ui.drivers,
    result.drivers.map((driver) => `${driver.label}: ${driver.detail}`)
  );
  setList(ui.actions, recommendations[result.tier.key]);
}

function parseInput(input) {
  return Number.parseInt(input.value, 10);
}

function validate() {
  const values = {
    population: parseInput(fields.population),
    acuteCare: parseInput(fields.acuteCare),
    longTermCare: parseInput(fields.longTermCare),
    labIsolates: parseInput(fields.labIsolates),
    timeFrame: fields.timeFrame.value
  };

  const invalid = Object.entries(values).find(([key, value]) => key !== "timeFrame" && (!Number.isFinite(value) || value < 0));
  if (invalid) {
    formMessage.textContent = "Enter non-negative values for every numeric field to run the assessment.";
    return null;
  }

  if (values.population === 0) {
    formMessage.textContent = "Population must be greater than zero to produce a meaningful score.";
    return null;
  }

  formMessage.textContent = "Assessment updated.";
  return values;
}

function handleSubmit(event) {
  event.preventDefault();
  const values = validate();
  if (!values) {
    return;
  }

  updateResults(calculateAssessment(values));
}

sampleButton.addEventListener("click", () => {
  fields.population.value = "50000";
  fields.acuteCare.value = "2";
  fields.longTermCare.value = "5";
  fields.labIsolates.value = "20";
  fields.timeFrame.value = "monthly";
  formMessage.textContent = "Sample data loaded. Run the model to view the result.";
});

form.addEventListener("submit", handleSubmit);
