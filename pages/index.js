import { useState, useEffect } from 'react';
import Head from 'next/head';

function HomePage() {
  const [cookies, setCookies] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [upgrades, setUpgrades] = useState({
    doubleClick: { count: 0, cost: 10, multiplier: 2, name: 'Double Click', desc: 'Click twice as fast', emoji: '👆' },
    megaClick: { count: 0, cost: 50, multiplier: 5, name: 'Mega Click', desc: 'Super powered clicks', emoji: '💪' },
    goldFingers: { count: 0, cost: 200, multiplier: 10, name: 'Golden Fingers', desc: 'Your clicks are worth more', emoji: '✨' },
    sugarRush: { count: 0, cost: 500, multiplier: 25, name: 'Sugar Rush', desc: 'Super-charged clicking', emoji: '⚡' },
    doubleProduction: { count: 0, cost: 2500, buildingBoost: 2, name: 'Double Production', desc: 'All buildings produce twice as much', emoji: '⚡' },
    cookieAlchemy: { count: 0, cost: 5000, multiplier: 100, name: 'Cookie Alchemy', desc: 'Turn regular cookies into golden ones', emoji: '✨' }
  });
  const [buildings, setBuildings] = useState({
    grandma: { count: 0, cost: 100, cps: 1, name: 'Grandma', desc: 'A nice grandma to bake cookies', emoji: '👵' },
    mine: { count: 0, cost: 500, cps: 5, name: 'Cookie Mine', desc: 'Dig deep for cookie dough', emoji: '⛏️' },
    factory: { count: 0, cost: 2000, cps: 25, name: 'Cookie Factory', desc: 'Mass produce cookies', emoji: '🏭' },
    farm: { count: 0, cost: 1000, cps: 8, name: 'Cookie Farm', desc: 'Grow cookie trees', emoji: '🌱' },
    lab: { count: 0, cost: 5000, cps: 50, name: 'Cookie Lab', desc: 'Research better cookie production', emoji: '🧪' },
    temple: { count: 0, cost: 10000, cps: 100, name: 'Cookie Temple', desc: 'Pray to the cookie gods', emoji: '⛪' },
    wizard: { count: 0, cost: 25000, cps: 250, name: 'Cookie Wizard', desc: 'Magic cookie spells', emoji: '🧙' },
    shipment: { count: 0, cost: 50000, cps: 500, name: 'Cookie Shipment', desc: 'Import cookies from the cookie planet', emoji: '🚀' },
    alchemy: { count: 0, cost: 100000, cps: 1000, name: 'Cookie Alchemy Lab', desc: 'Transform matter into cookies', emoji: '⚗️' },
    portal: { count: 0, cost: 500000, cps: 5000, name: 'Cookie Portal', desc: 'Connect to the cookieverse', emoji: '🌀' }
  });

  const handleClick = () => {
    const multiplier = (upgrades.doubleClick.count * upgrades.doubleClick.multiplier) +
                      (upgrades.megaClick.count * upgrades.megaClick.multiplier) +
                      (upgrades.goldFingers.count * upgrades.goldFingers.multiplier) +
                      (upgrades.sugarRush.count * upgrades.sugarRush.multiplier) +
                      (upgrades.cookieAlchemy.count * upgrades.cookieAlchemy.multiplier) + 1;
    setCookies(prev => prev + multiplier);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100);
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
        alert(`Welcome back! You earned ${offlineEarnings} cookies while away!`);
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
        <title>Cookie Clicker Game</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍪</text></svg>"
        />
      </Head>
      <div className="flex min-h-screen bg-slate-900 overflow-hidden">
        <div className="w-64 bg-slate-800/50 p-4 overflow-y-auto scrollbar-hidden h-screen backdrop-blur-sm">
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

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="flex flex-col items-center justify-center flex-1">
            <h1 className="text-6xl font-bold text-amber-400 mb-8 drop-shadow-lg">
              Cookie Clicker
            </h1>
            <div className="text-4xl text-white mb-8 drop-shadow">
              Cookies: {Math.floor(cookies)}
            </div>
            <div className="text-xl text-slate-400 mb-6">
              per second: {(Object.values(buildings).reduce(
                (acc, building) => acc + calculateBuildingProduction(building), 0
              )).toFixed(1)}
            </div>
            <button
              onClick={handleClick}
              className={`text-[150px] cursor-pointer transform transition-all duration-100 
                hover:scale-110 active:scale-95 ${isAnimating ? 'scale-95' : 'scale-100'}
                filter drop-shadow-2xl hover:drop-shadow-[0_0_25px_rgba(251,191,36,0.2)]`}
            >
              🍪
            </button>
          </div>
        </div>

        <div className="w-64 bg-slate-800/50 p-4 overflow-y-auto scrollbar-hidden h-screen backdrop-blur-sm">
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
    </>
  );
}

export default HomePage;
