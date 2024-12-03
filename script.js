document.addEventListener("DOMContentLoaded", function () {
  const addDistributionButton = document.getElementById(
    "add-distribution-button"
  );
  const distributionsContainer = document.getElementById(
    "distributions-container"
  );
  const generateButton = document.getElementById("generate-button");
  const startButton = document.getElementById("start-button");
  const stopButton = document.getElementById("stop-button");
  const clearCanvasButton = document.getElementById("clear-canvas-button");
  const canvas = document.getElementById("art-canvas");
  const ctx = canvas.getContext("2d");
  const visualizersContainer = document.getElementById("visualizers-container");

  // Variables for speed control
  const speedInput = document.getElementById("speed-input");
  const speedDisplay = document.getElementById("speed-display");
  let speed = parseInt(speedInput.value); // Set speed directly from slider

  let audioCtx;
  let isGenerating = false;
  let generateInterval;
  let visualizers = {};

  let distributionCount = 0;
  let usedColors = [];

  const defaultColors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ffff00",
    "#ffa500",
    "#800080",
  ];

  function updateSpeed(newSpeed) {
    speedDisplay.textContent = `faster <- ${newSpeed} ms -> slower`;
    if (isGenerating) {
      clearInterval(generateInterval);
      generateInterval = setInterval(generateArtAndMusic, newSpeed);
    }
  }

  // Initialize speed display
  updateSpeed(speed);

  speedInput.addEventListener("input", function () {
    speed = parseInt(speedInput.value);
    updateSpeed(speed);
  });

  addDistributionButton.addEventListener("click", function () {
    addDistribution();
  });

  // Add the first distribution by default
  addDistribution();

  function addDistribution() {
    distributionCount++;
    const distId = "dist" + distributionCount;

    const distDiv = document.createElement("div");
    distDiv.className = "distribution-instance";
    distDiv.id = distId;

    // Assign a default color that hasn't been used yet
    let defaultColor =
      defaultColors[(distributionCount - 1) % defaultColors.length];
    usedColors.push(defaultColor);

    distDiv.innerHTML = `
            <h3>Distribution ${distributionCount}</h3>
            <label>Type:
              <select name="type" class="distribution-type">
                <option value="binomial">Binomial</option>
                <option value="poisson">Poisson</option>
                <option value="normal">Normal</option>
              </select>
            </label>
            <div class="parameters"></div>
            <label>Color:
              <input type="color" name="color" value="${defaultColor}">
            </label>
            <label>Instrument:
              <select name="instrument">
                <option value="sine">Sine Wave</option>
                <option value="square">Square Wave</option>
                <option value="sawtooth">Sawtooth Wave</option>
                <option value="triangle">Triangle Wave</option>
              </select>
            </label>
            <button type="button" class="remove-distribution-button">Remove Distribution</button>
          `;

    distributionsContainer.appendChild(distDiv);

    const distributionTypeSelect = distDiv.querySelector(".distribution-type");
    const parametersDiv = distDiv.querySelector(".parameters");
    const removeButton = distDiv.querySelector(".remove-distribution-button");
    const colorInput = distDiv.querySelector('input[name="color"]');

    distributionTypeSelect.addEventListener("change", function () {
      updateParameters(distDiv, distributionTypeSelect.value);
      updateProbabilityGraph(distDiv.id);
    });

    parametersDiv.addEventListener("input", function () {
      updateProbabilityGraph(distDiv.id);
    });

    colorInput.addEventListener("input", function () {
      visualizers[distId].color = colorInput.value;
      updateProbabilityGraph(distDiv.id);
    });

    // Initialize parameters
    updateParameters(distDiv, distributionTypeSelect.value);

    removeButton.addEventListener("click", function () {
      distributionsContainer.removeChild(distDiv);
      delete visualizers[distId];
      const visualizerContainer = document.getElementById(
        `visualizer-container-${distId}`
      );
      if (visualizerContainer) {
        visualizersContainer.removeChild(visualizerContainer);
      }
    });

    const visualizerContainer = document.createElement("div");
    visualizerContainer.className = "visualizer-container";
    visualizerContainer.id = `visualizer-container-${distId}`;

    const barGraphDiv = document.createElement("div");
    barGraphDiv.className = "bar-graph";
    barGraphDiv.id = `bar-graph-${distId}`;
    visualizerContainer.appendChild(barGraphDiv);

    const visualizerCanvas = document.createElement("canvas");
    visualizerCanvas.className = "visualizer";
    visualizerCanvas.id = `visualizer-${distId}`;
    visualizerCanvas.width = 600;
    visualizerCanvas.height = 150;
    visualizerContainer.appendChild(visualizerCanvas);

    visualizersContainer.appendChild(visualizerContainer);

    visualizers[distId] = {
      canvas: visualizerCanvas,
      context: visualizerCanvas.getContext("2d"),
      notes: [],
      maxNotes: 30,
      currentIndex: 0,
      color: defaultColor,
      barGraph: barGraphDiv,
      probabilities: [],
    };
    drawStaffLines(
      visualizers[distId].context,
      visualizerCanvas.width,
      visualizerCanvas.height
    );

    // Initial probability graph update
    updateProbabilityGraph(distDiv.id);
  }

  function updateParameters(distDiv, distType) {
    const parametersDiv = distDiv.querySelector(".parameters");
    parametersDiv.innerHTML = ""; // Clear previous parameters

    if (distType === "binomial") {
      parametersDiv.innerHTML += `
              <label>n (number of trials):
                <input type="number" name="n" min="1" value="10">
              </label>
              <label>p (probability of success):
                <input type="number" name="p" min="0" max="1" step="0.01" value="0.5">
              </label>
            `;
    } else if (distType === "poisson") {
      parametersDiv.innerHTML += `
              <label>λ (average rate):
                <input type="number" name="lambda" min="0" step="0.1" value="5">
              </label>
            `;
    } else if (distType === "normal") {
      parametersDiv.innerHTML += `
              <label>μ (mean):
                <input type="number" name="mean" value="0">
              </label>
              <label>σ (standard deviation):
                <input type="number" name="stddev" min="0" step="0.1" value="1">
              </label>
            `;
    }

    const inputs = parametersDiv.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        updateProbabilityGraph(distDiv.id);
      });
    });
  }

  generateButton.addEventListener("click", function () {
    generateArtAndMusic();
  });

  startButton.addEventListener("click", function () {
    if (!isGenerating) {
      isGenerating = true;
      generateInterval = setInterval(generateArtAndMusic, speed);
      startButton.disabled = true;
      stopButton.disabled = false;
    }
  });

  stopButton.addEventListener("click", stop);

  function stop() {
    if (isGenerating) {
      clearInterval(generateInterval);
      isGenerating = false;
      startButton.disabled = false;
      stopButton.disabled = true;
    }
  }

  clearCanvasButton.addEventListener("click", function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  function generateArtAndMusic() {
    const distDivs = document.querySelectorAll(".distribution-instance");
    if (distDivs.length === 0) {
      alert("Please add at least one distribution.");
      stop();
      return;
    }

    let randomValues = [];

    distDivs.forEach((distDiv) => {
      const distId = distDiv.id;
      const distType = distDiv.querySelector(".distribution-type").value;
      const color = distDiv.querySelector('input[name="color"]').value;
      const instrument = distDiv.querySelector(
        'select[name="instrument"]'
      ).value;
      const parametersDiv = distDiv.querySelector(".parameters");
      let randomValue;

      if (distType === "binomial") {
        const n = parseInt(
          parametersDiv.querySelector('input[name="n"]').value
        );
        const p = parseFloat(
          parametersDiv.querySelector('input[name="p"]').value
        );
        randomValue = binomialRandom(n, p);
      } else if (distType === "poisson") {
        const lambda = parseFloat(
          parametersDiv.querySelector('input[name="lambda"]').value
        );
        randomValue = poissonRandom(lambda);
      } else if (distType === "normal") {
        const mean = parseFloat(
          parametersDiv.querySelector('input[name="mean"]').value
        );
        const stddev = parseFloat(
          parametersDiv.querySelector('input[name="stddev"]').value
        );
        randomValue = normalRandom(mean, stddev);
      }

      randomValues.push({
        distributionId: distId,
        distributionType: distType,
        value: randomValue,
        color: color,
        instrument: instrument,
      });

      visualizers[distId].color = color;
    });

    drawArt(randomValues);

    playMusic(randomValues);
  }

  function binomialRandom(n, p) {
    let successes = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) {
        successes++;
      }
    }
    return successes;
  }

  function poissonRandom(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  function normalRandom(mean, stddev) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stddev + mean;
  }

  function drawArt(values) {
    values.forEach((item) => {
      const value = item.value;
      const color = item.color;

      const angle = (value * 137.5) % 360;
      const radius = Math.abs(value) * 5;

      const x = canvas.width / 2 + radius * Math.cos(angle * (Math.PI / 180));
      const y = canvas.height / 2 + radius * Math.sin(angle * (Math.PI / 180));

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI, false);

      ctx.fillStyle = color;

      ctx.fill();
    });
  }

  function playMusic(values) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const notesPerDistribution = {};
    values.forEach((item) => {
      if (!notesPerDistribution[item.distributionId]) {
        notesPerDistribution[item.distributionId] = [];
      }
      notesPerDistribution[item.distributionId].push(item);
    });

    Object.keys(notesPerDistribution).forEach((distId) => {
      const items = notesPerDistribution[distId];
      const visualizer = visualizers[distId];
      let currentTime = audioCtx.currentTime;

      items.forEach((item) => {
        const value = item.value;
        const instrument = item.instrument;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        const frequency = valueToFrequency(value);

        oscillator.frequency.setValueAtTime(frequency, currentTime);
        oscillator.type = instrument;

        const attackTime = 0.05;
        const releaseTime = 0.05;
        const sustainLevel = 0.1;
        const noteDuration = 0.5;

        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(
          sustainLevel,
          currentTime + attackTime
        );
        gainNode.gain.setValueAtTime(
          sustainLevel,
          currentTime + noteDuration - releaseTime
        );
        gainNode.gain.linearRampToValueAtTime(0, currentTime + noteDuration);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(currentTime);
        oscillator.stop(currentTime + noteDuration);

        scheduleVisualizerUpdate(
          visualizer,
          frequency,
          currentTime,
          noteDuration
        );

        // Move to the next note
        currentTime += noteDuration - releaseTime;
      });
    });
  }

  function valueToFrequency(value) {
    const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
    let index = Math.round(value);

    if (index < 0) index = 0;
    if (index >= notes.length) index = notes.length - 1;

    return notes[index];
  }

  function scheduleVisualizerUpdate(
    visualizer,
    frequency,
    startTime,
    noteDuration
  ) {
    const delay = (startTime - audioCtx.currentTime) * 1000;

    setTimeout(() => {
      updateVisualizer(visualizer, frequency);
    }, delay);
  }

  function updateVisualizer(visualizer, frequency) {
    const ctx = visualizer.context;
    const canvasWidth = visualizer.canvas.width;
    const canvasHeight = visualizer.canvas.height;
    const noteWidth = canvasWidth / visualizer.maxNotes;
    const noteHeight = 20;

    if (visualizer.notes.length < visualizer.maxNotes) {
      visualizer.notes.push(frequency);
    } else {
      visualizer.notes[visualizer.currentIndex] = frequency;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawStaffLines(ctx, canvasWidth, canvasHeight);

    visualizer.notes.forEach((freq, index) => {
      const x = index * noteWidth + noteWidth / 2;
      const y = frequencyToY(freq, canvasHeight);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "black";
      ctx.fill();
    });

    const currentX = visualizer.currentIndex * noteWidth + noteWidth / 2;
    const currentY = frequencyToY(frequency, canvasHeight);
    ctx.beginPath();
    ctx.arc(currentX, currentY, 7, 0, 2 * Math.PI);

    ctx.strokeStyle = visualizer.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    visualizer.currentIndex =
      (visualizer.currentIndex + 1) % visualizer.maxNotes;
  }

  function drawStaffLines(ctx, width, height) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    const staffSpacing = 20;
    const staffHeight = staffSpacing * 4;
    const topOffset = (height - staffHeight) / 2;

    for (let i = 0; i < 5; i++) {
      const y = topOffset + i * staffSpacing;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function frequencyToY(frequency, canvasHeight) {
    const noteFrequencies = {
      261.63: 4, // C4
      293.66: 3.5, // D4
      329.63: 3, // E4
      349.23: 2.5, // F4
      392.0: 2, // G4
      440.0: 1.5, // A4
      493.88: 1, // B4
    };
    const staffSpacing = 20;
    const staffHeight = staffSpacing * 4;
    const topOffset = (canvasHeight - staffHeight) / 2;
    const position = noteFrequencies[frequency] || 4; // Default to C4 if frequency not found
    const y = topOffset + position * staffSpacing;
    return y;
  }

  function updateProbabilityGraph(distId) {
    const visualizer = visualizers[distId];
    const distDiv = document.getElementById(distId);
    const distType = distDiv.querySelector(".distribution-type").value;
    const parametersDiv = distDiv.querySelector(".parameters");
    const color = distDiv.querySelector('input[name="color"]').value;
    const barGraphDiv = visualizer.barGraph;

    let probabilities = [];
    const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
    const numNotes = notes.length;
    let totalProbability = 0;

    if (distType === "binomial") {
      const n = parseInt(parametersDiv.querySelector('input[name="n"]').value);
      const p = parseFloat(
        parametersDiv.querySelector('input[name="p"]').value
      );

      if (n < 1 || p < 0 || p > 1) {
        alert("Please enter valid parameters for the Binomial distribution.");
        if (n < 1) {
          n = 1;
        }
        if (p < 0) {
          p = 0;
        }
        if (p > 1) {
          p = 1;
        }
        return;
      }

      const probabilitiesMap = {};
      for (let k = 0; k <= n; k++) {
        const prob = binomialPMF(n, p, k);
        // Scale k to the number of bars without wrapping
        const index = Math.floor((k / n) * (numNotes - 1));
        probabilitiesMap[index] = (probabilitiesMap[index] || 0) + prob;
        totalProbability += prob;
      }

      probabilities = notes.map((_, index) => probabilitiesMap[index] || 0);
    } else if (distType === "poisson") {
      const lambda = parseFloat(
        parametersDiv.querySelector('input[name="lambda"]').value
      );

      if (lambda < 0) {
        alert("Please enter a valid λ for the Poisson distribution.");
        lambda = 0;
        return;
      }

      const probabilitiesMap = {};
      const maxK = Math.ceil(lambda + 10 * Math.sqrt(lambda));
      for (let k = 0; k <= maxK; k++) {
        const prob = poissonPMF(lambda, k);
        // Scale k to the number of bars without wrapping
        const index = Math.floor((k / maxK) * (numNotes - 1));
        probabilitiesMap[index] = (probabilitiesMap[index] || 0) + prob;
        totalProbability += prob;
      }

      probabilities = notes.map((_, index) => probabilitiesMap[index] || 0);
    } else if (distType === "normal") {
      const mean = parseFloat(
        parametersDiv.querySelector('input[name="mean"]').value
      );
      const stddev = parseFloat(
        parametersDiv.querySelector('input[name="stddev"]').value
      );

      if (stddev <= 0) {
        alert("Please enter a positive σ for the Normal distribution.");
        stddev = 0;
        return;
      }

      // Calculate probabilities over a range
      const probabilitiesMap = {};
      const minX = mean - 4 * stddev;
      const maxX = mean + 4 * stddev;
      const step = (maxX - minX) / 100;

      for (let x = minX; x <= maxX; x += step) {
        const prob = normalPDF(mean, stddev, x) * step;
        // Scale x to the number of bars without wrapping
        const index = Math.floor(((x - minX) / (maxX - minX)) * (numNotes - 1));
        probabilitiesMap[index] = (probabilitiesMap[index] || 0) + prob;
        totalProbability += prob;
      }

      probabilities = notes.map((_, index) => probabilitiesMap[index] || 0);
    }

    probabilities = probabilities.map((prob) => prob / totalProbability);

    visualizer.probabilities = probabilities;

    drawBarGraph(barGraphDiv, probabilities, color);
  }

  function drawBarGraph(container, probabilities, color) {
    container.innerHTML = ""; // Clear previous bars

    const containerHeight = container.clientHeight;
    const barHeightMax = containerHeight - 20;

    probabilities.forEach((prob, index) => {
      const barLength = prob * barHeightMax;

      const barDiv = document.createElement("div");
      barDiv.className = "bar";
      barDiv.style.height = `${barLength}px`;
      barDiv.style.width = "10px";
      barDiv.style.backgroundColor = color;

      container.appendChild(barDiv);
    });
  }

  function binomialPMF(n, p, k) {
    return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  function poissonPMF(lambda, k) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }

  function normalPDF(mean, stddev, x) {
    return (
      (1 / (stddev * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * Math.pow((x - mean) / stddev, 2))
    );
  }

  // n choose k
  function combination(n, k) {
    return factorial(n) / (factorial(k) * factorial(n - k));
  }

  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }
});
