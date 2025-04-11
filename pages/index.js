import { useState, useEffect } from 'react';
import Head from 'next/head';

function HomePage() {
  const [cookies, setCookies] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [energy, setEnergy] = useState(100); // Max energy
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [customQuestions, setCustomQuestions] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });
  const [notifications, setNotifications] = useState([]);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [lastWrongAnswer, setLastWrongAnswer] = useState(0);
  const [questionCooldown, setQuestionCooldown] = useState(false);

  // Notification system
  const addNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the file format
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid file format: missing questions array');
      }

      // Validate each question
      data.questions.forEach((q, i) => {
        if (!q.question || !q.correctAnswer || !q.options || !Array.isArray(q.options)) {
          throw new Error(`Invalid question format at index ${i}`);
        }
      });

      setCustomQuestions(data);
      addNotification(`Loaded ${data.questions.length} questions from "${data.title}"`, 'success');
    } catch (error) {
      addNotification('Error loading questions: ' + error.message, 'error');
      console.error('Error loading questions:', error);
    }
  };

  // Generate a random math question
  const generateMathQuestion = () => {
    const operators = ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;
    
    switch(operator) {
      case '+':
        num1 = Math.floor(Math.random() * 10) + 1; // Simplified numbers
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 5) + 1; // Smaller numbers for division
        answer = Math.floor(Math.random() * 5) + 1;
        num1 = num2 * answer;
        break;
    }

    const options = [answer];
    while (options.length < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const wrongAnswer = answer + (Math.random() < 0.5 ? offset : -offset);
      if (!options.includes(wrongAnswer) && wrongAnswer >= 0) {
        options.push(wrongAnswer);
      }
    }

    return {
      question: `What is ${num1} ${operator} ${num2}?`,
      options: options.sort(() => Math.random() - 0.5).map(String),
      correctAnswer: String(answer)
    };
  };

  // Load questions from JSON file on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch('/number-systems.json');
        if (!response.ok) {
          throw new Error('Failed to load questions file');
        }
        const data = await response.json();
        if (!data || !data.questions || !Array.isArray(data.questions)) {
          throw new Error('Invalid questions format');
        }
        setCustomQuestions(data);
        addNotification(`Loaded ${data.questions.length} questions from "${data.title}"`, 'success');
      } catch (error) {
        console.error('Error loading questions:', error);
        // Don't show warning if it's the first load
        if (customQuestions !== null) {
          addNotification('Error loading questions. Using math questions instead.', 'warning');
        }
      }
    };
    loadQuestions();
  }, []);

  // Modified to use math questions as fallback
  const generateQuestion = () => {
    if (customQuestions && customQuestions.questions && customQuestions.questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * customQuestions.questions.length);
      return customQuestions.questions[randomIndex];
    }
    return generateMathQuestion();
  };

  const [upgrades, setUpgrades] = useState({
    // Click-related upgrades - adjusted for better early game
    doubleClick: { count: 0, cost: 15, multiplier: 1, name: 'Double Click', desc: 'Increase click value by 1', emoji: '👆' },
    megaClick: { count: 0, cost: 100, multiplier: 2, name: 'Mega Click', desc: 'Increase click value by 2', emoji: '💪' },
    goldFingers: { count: 0, cost: 500, multiplier: 5, name: 'Golden Fingers', desc: 'Increase click value by 5', emoji: '✨' },
    sugarRush: { count: 0, cost: 2000, multiplier: 10, name: 'Sugar Rush', desc: 'Increase click value by 10', emoji: '⚡' },
    doubleProduction: { count: 0, cost: 5000, buildingBoost: 1, name: 'Double Production', desc: 'Buildings produce 100% more', emoji: '⚡' },
    cookieAlchemy: { count: 0, cost: 10000, multiplier: 50, name: 'Cookie Alchemy', desc: 'Increase click value by 50', emoji: '✨' },
    
    // Energy upgrades - rebalanced for progression
    energyEfficiency: { count: 0, cost: 75, energyBoost: 0.1, name: 'Energy Efficiency', desc: 'Reduce energy cost per click by 10%', emoji: '🔋' },
    energyCapacity: { count: 0, cost: 200, capacityBoost: 20, name: 'Energy Capacity', desc: 'Increase max energy by 20', emoji: '⚡' },
    energyRegen: { count: 0, cost: 1000, regenAmount: 0.2, name: 'Energy Regeneration', desc: 'Regenerate 0.2 energy per second', emoji: '♻️' }
  });

  const [buildings, setBuildings] = useState({
    // Buildings rebalanced for smoother progression
    grandma: { count: 0, cost: 50, cps: 0.2, name: 'Grandma', desc: 'A nice grandma to bake cookies', emoji: '👵' },
    mine: { count: 0, cost: 200, cps: 1, name: 'Cookie Mine', desc: 'Dig deep for cookie dough', emoji: '⛏️' },
    farm: { count: 0, cost: 750, cps: 4, name: 'Cookie Farm', desc: 'Grow cookie trees', emoji: '🌱' },
    factory: { count: 0, cost: 2500, cps: 15, name: 'Cookie Factory', desc: 'Mass produce cookies', emoji: '🏭' },
    lab: { count: 0, cost: 7500, cps: 40, name: 'Cookie Lab', desc: 'Research better cookie production', emoji: '🧪' },
    temple: { count: 0, cost: 15000, cps: 100, name: 'Cookie Temple', desc: 'Pray to the cookie gods', emoji: '⛪' },
    wizard: { count: 0, cost: 50000, cps: 300, name: 'Cookie Wizard', desc: 'Magic cookie spells', emoji: '🧙' },
    shipment: { count: 0, cost: 150000, cps: 1000, name: 'Cookie Shipment', desc: 'Import cookies from the cookie planet', emoji: '🚀' },
    alchemy: { count: 0, cost: 500000, cps: 3000, name: 'Cookie Alchemy Lab', desc: 'Transform matter into cookies', emoji: '⚗️' },
    portal: { count: 0, cost: 1500000, cps: 10000, name: 'Cookie Portal', desc: 'Connect to the cookieverse', emoji: '🌀' }
  });

  const getMaxEnergy = () => 100 + (upgrades.energyCapacity.count * upgrades.energyCapacity.capacityBoost);

  const getEnergyCostPerClick = () => {
    const baseEnergyCost = 2; // Reduced from 5 to 2 for better early game
    const reduction = upgrades.energyEfficiency.count * upgrades.energyEfficiency.energyBoost;
    return Math.max(0.2, baseEnergyCost * (1 - reduction)); // Minimum 0.2 energy cost
  };

  const handleClick = () => {
    const energyCost = getEnergyCostPerClick();
    if (energy < energyCost) {
      return; // Just return if not enough energy, don't show question
    }

    const multiplier = (upgrades.doubleClick.count * upgrades.doubleClick.multiplier) +
                      (upgrades.megaClick.count * upgrades.megaClick.multiplier) +
                      (upgrades.goldFingers.count * upgrades.goldFingers.multiplier) +
                      (upgrades.sugarRush.count * upgrades.sugarRush.multiplier) +
                      (upgrades.cookieAlchemy.count * upgrades.cookieAlchemy.multiplier) + 1;

    setCookies(prev => prev + multiplier);
    setEnergy(prev => Math.max(0, prev - energyCost));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);
  };

  const handleStartQuestion = () => {
    // Check if user is in cooldown
    if (questionCooldown) {
      addNotification('Please wait before trying again!', 'warning');
      return;
    }
    const newQuestion = generateQuestion();
    setCurrentQuestion(newQuestion);
    setShowQuestion(true);
  };

  const handleCloseQuestion = () => {
    setShowQuestion(false);
    setCurrentQuestion(null);
  };

  const handleAnswerQuestion = (selectedAnswer) => {
    const now = Date.now();
    
    if (selectedAnswer === currentQuestion.correctAnswer) {
      // Correct answer: Award energy based on streak
      const streakBonus = Math.min(answerStreak * 5, 25); // Cap bonus at 25
      const energyGain = 25 + streakBonus;
      setEnergy(prev => Math.min(getMaxEnergy(), prev + energyGain));
      setAnswerStreak(prev => prev + 1);
      addNotification(`+${energyGain} energy! Streak: ${answerStreak + 1}`, 'success');
    } else {
      // Wrong answer: Penalize and reset streak
      const timeSinceLastWrong = now - lastWrongAnswer;
      
      // If answering wrong too quickly, increase penalty and add cooldown
      if (timeSinceLastWrong < 2000) { // 2 seconds
        setEnergy(prev => Math.max(0, prev - 15)); // Bigger penalty for spam
        setQuestionCooldown(true);
        setTimeout(() => setQuestionCooldown(false), 5000); // 5 second cooldown
        addNotification('-15 energy! Too many wrong answers!', 'warning');
      } else {
        setEnergy(prev => Math.max(0, prev - 5)); // Normal wrong answer penalty
        addNotification('-5 energy', 'warning');
      }
      
      setLastWrongAnswer(now);
      setAnswerStreak(0);
    }
    
    // Generate new question immediately
    const newQuestion = generateQuestion();
    setCurrentQuestion(newQuestion);
  };

  const buyUpgrade = (type) => {
    const upgrade = upgrades[type];
    if (cookies >= upgrade.cost) {
      setCookies(prev => prev - upgrade.cost);
      setUpgrades(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          count: prev[type].count + 1,
          cost: Math.floor(prev[type].cost * 1.5),
        }
      }));
    }
  };

  const buyBuilding = (type) => {
    const building = buildings[type];
    if (cookies >= building.cost) {
      setCookies(prev => prev - building.cost);
      setBuildings(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          count: prev[type].count + 1,
          cost: Math.floor(prev[type].cost * 1.15),
        }
      }));
    }
  };

  const calculateBuildingProduction = (building) => {
    const productionMultiplier = 1 + (upgrades.doubleProduction.count * upgrades.doubleProduction.buildingBoost);
    return building.count * building.cps * productionMultiplier;
  };

  const calculateTotalCps = () => {
    return Object.values(buildings).reduce(
      (acc, building) => acc + calculateBuildingProduction(building), 0
    );
  };

  useEffect(() => {
    const lastTimestamp = localStorage.getItem('lastTimestamp');
    if (lastTimestamp) {
      const now = Date.now();
      const timeDiff = now - parseInt(lastTimestamp);
      const offlineSeconds = Math.floor(timeDiff / 1000);
      const offlineEarnings = Math.floor(calculateTotalCps() * offlineSeconds);
      
      if (offlineEarnings > 0) {
        setCookies(prev => prev + offlineEarnings);
        addNotification(`Welcome back! You earned ${offlineEarnings} cookies while away!`, 'success');
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('lastTimestamp', Date.now().toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const totalIncome = calculateTotalCps();
      if (totalIncome > 0) {
        setCookies(prev => prev + totalIncome / 10);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [buildings, upgrades.doubleProduction]);

  return (
    <>
      <Head>
        <title>Cookie Clicker</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍪</text></svg>"
        />
      </Head>

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform 
              ${notification.type === 'success' ? 'bg-green-600' : 'bg-yellow-600'}`}
          >
            <span className="text-white font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      <div className="flex h-screen bg-slate-900 overflow-hidden">
        {/* Left sidebar - Scrollable */}
        <div className="w-64 bg-slate-800/50 overflow-y-auto scrollbar-hidden">
          <div className="p-4">
            <h2 className="text-xl font-bold text-amber-400 mb-3">Buildings</h2>
            {Object.entries(buildings).map(([key, building]) => (
              <button
                key={key}
                onClick={() => buyBuilding(key)}
                disabled={cookies < building.cost}
                className={`w-full mb-2 p-2 rounded text-left transition-all duration-200 ${
                  cookies >= building.cost 
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg hover:shadow-amber-900/20' 
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  <span className="text-xl filter drop-shadow">{building.emoji}</span>
                  {building.name}
                </div>
                <div className="text-sm opacity-90">Owned: {building.count}</div>
                <div className="text-sm opacity-90">CPS: {building.cps}</div>
                <div className="text-sm opacity-90">Cost: {Math.floor(building.cost)} cookies</div>
                <div className="text-xs text-slate-300/75">{building.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content - Fixed */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Stats Bar */}
          <div className="bg-slate-800/90 backdrop-blur-sm p-4 border-b border-slate-700">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-2xl text-white mb-1">
                  🍪 {Math.floor(cookies)}
                </div>
                <div className="text-sm text-slate-400">
                  per second: {calculateTotalCps().toFixed(1)}
                </div>
              </div>

              {/* Energy Section */}
              <div className="flex-1 mr-4">
                <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(energy / getMaxEnergy()) * 100}%` }}
                  />
                </div>
                <div className="text-white text-sm mt-2 mb-1">
                  Energy: {Math.floor(energy)}/{getMaxEnergy()}
                </div>
                {answerStreak > 0 && (
                  <div className="text-green-400 text-sm">
                    🔥 Streak: {answerStreak}
                  </div>
                )}
              </div>

              {/* Question Button */}
              <button
                onClick={handleStartQuestion}
                disabled={showQuestion || questionCooldown}
                className={`bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded transition-colors whitespace-nowrap
                  ${(showQuestion || questionCooldown) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {questionCooldown ? 'Cooling down...' : 'Answer Questions'}
              </button>
            </div>
          </div>

          {/* Game Area - Fixed position */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <h1 className="text-6xl font-bold text-amber-400 mb-8 drop-shadow-lg">
              Cookie Clicker
            </h1>

            {/* Cookie Button */}
            <button
              onClick={handleClick}
              disabled={energy < getEnergyCostPerClick()}
              className={`text-[150px] cursor-pointer transform transition-all duration-100 
                hover:scale-110 active:scale-95 ${isAnimating ? 'scale-95' : 'scale-100'}
                filter drop-shadow-2xl hover:drop-shadow-[0_0_25px_rgba(251,191,36,0.2)]
                ${energy < getEnergyCostPerClick() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              🍪
            </button>
            
            <div className="text-white mt-4 text-sm">
              Energy cost per click: {getEnergyCostPerClick().toFixed(1)}
            </div>
          </div>
        </div>

        {/* Right sidebar - Scrollable */}
        <div className="w-64 bg-slate-800/50 overflow-y-auto scrollbar-hidden">
          <div className="p-4">
            <h2 className="text-xl font-bold text-amber-400 mb-3">Upgrades</h2>
            {Object.entries(upgrades).map(([key, upgrade]) => (
              <button
                key={key}
                onClick={() => buyUpgrade(key)}
                disabled={cookies < upgrade.cost}
                className={`w-full mb-2 p-2 rounded text-left transition-all duration-200 ${
                  cookies >= upgrade.cost 
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg hover:shadow-amber-900/20' 
                    : 'bg-slate-700/50 text-slate-400'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  <span className="text-xl filter drop-shadow">{upgrade.emoji}</span>
                  {upgrade.name}
                </div>
                <div className="text-sm opacity-90">Owned: {upgrade.count}</div>
                <div className="text-sm opacity-90">Cost: {upgrade.cost} cookies</div>
                <div className="text-xs text-slate-300/75">{upgrade.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Question Panel - Animated overlay */}
        {showQuestion && (
          <div className="fixed inset-0 bg-slate-900/75 flex items-center justify-center z-30 transition-opacity duration-300">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 scale-100 opacity-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-400">
                  {customQuestions ? customQuestions.title : 'Math Question'}
                </h2>
                <button
                  onClick={handleCloseQuestion}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-xl text-white mb-6">{currentQuestion?.question}</div>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerQuestion(option)}
                    className="bg-amber-600 hover:bg-amber-500 text-white p-4 rounded transition-colors text-lg"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HomePage;
