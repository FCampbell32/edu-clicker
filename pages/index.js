import { useState, useEffect } from 'react';
import Head from 'next/head';

function HomePage() {
  const [cookies, setCookies] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [upgrades, setUpgrades] = useState({
    doubleClick: { count: 0, cost: 10, multiplier: 2, name: 'Double Click' },
    autoClick: { count: 0, cost: 15, cps: 0.1, name: 'Auto Clicker' },
    megaClick: { count: 0, cost: 50, multiplier: 5, name: 'Mega Click' },
  });
  const [buildings, setBuildings] = useState({
    grandma: { count: 0, cost: 100, cps: 1, name: 'Grandma', desc: 'A nice grandma to bake cookies' },
    mine: { count: 0, cost: 500, cps: 5, name: 'Cookie Mine', desc: 'Dig deep for cookie dough' },
    factory: { count: 0, cost: 2000, cps: 25, name: 'Cookie Factory', desc: 'Mass produce cookies' },
  });

  const handleClick = () => {
    const multiplier = (upgrades.doubleClick.count * upgrades.doubleClick.multiplier) +
                      (upgrades.megaClick.count * upgrades.megaClick.multiplier) + 1;
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

  useEffect(() => {
    const interval = setInterval(() => {
      const buildingIncome = Object.values(buildings).reduce(
        (acc, building) => acc + (building.count * building.cps), 0
      );
      const autoClickIncome = upgrades.autoClick.count * upgrades.autoClick.cps;
      if (buildingIncome > 0 || autoClickIncome > 0) {
        setCookies(prev => prev + buildingIncome + autoClickIncome);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [buildings, upgrades.autoClick]);

  return (
    <>
      <Head>
        <title>Cookie Clicker Game</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍪</text></svg>"
        />
      </Head>
      <div className="flex min-h-screen bg-gray-900">
        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Buildings</h2>
          {Object.entries(buildings).map(([key, building]) => (
            <button
              key={key}
              onClick={() => buyBuilding(key)}
              disabled={cookies < building.cost}
              className={`w-full mb-2 p-2 rounded text-left ${
                cookies >= building.cost 
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              <div className="font-bold">{building.name}</div>
              <div className="text-sm">Owned: {building.count}</div>
              <div className="text-sm">CPS: {building.cps}</div>
              <div className="text-sm">Cost: {Math.floor(building.cost)} cookies</div>
              <div className="text-xs text-gray-300">{building.desc}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-6xl font-bold text-yellow-400 mb-8">
            Cookie Clicker
          </h1>
          <div className="text-4xl text-white mb-8">
            Cookies: {Math.floor(cookies)}
          </div>
          <div className="text-xl text-gray-400 mb-6">
            per second: {(Object.values(buildings).reduce(
              (acc, building) => acc + (building.count * building.cps), 0
            )).toFixed(1)}
          </div>
          <button
            onClick={handleClick}
            className={`text-[150px] cursor-pointer transform transition-all duration-100 
              hover:scale-110 active:scale-95 ${isAnimating ? 'scale-95' : 'scale-100'}`}
          >
            🍪
          </button>
        </div>

        <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">Upgrades</h2>
          {Object.entries(upgrades).map(([key, upgrade]) => (
            <button
              key={key}
              onClick={() => buyUpgrade(key)}
              disabled={cookies < upgrade.cost}
              className={`w-full mb-2 p-2 rounded text-left ${
                cookies >= upgrade.cost 
                  ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              <div className="font-bold">{upgrade.name}</div>
              <div className="text-sm">Owned: {upgrade.count}</div>
              <div className="text-sm">Cost: {upgrade.cost} cookies</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default HomePage;
