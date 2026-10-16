import { useEffect, useRef, useState } from "react";
import { createGameSession } from "./application/create-game-session.js";
import { AdsenseSlot } from "./ui/adsense-slot.jsx";

const format = value => Number(value || 0).toLocaleString("pt-BR");

function Stat({ label, children, className = "" }) {
  return <div className={`stat ${className}`}><span>{label}</span><strong>{children}</strong></div>;
}

function App() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const touchStartRef = useRef(null);
  const [game, setGame] = useState({ status: "idle", score: 0, best: 0, coins: 0, level: 1, next: [2, 4, 2], fever: 0, streak: 0, largest: 2 });

  useEffect(() => {
    const engine = createGameSession(canvasRef.current, setGame);
    engineRef.current = engine;
    return () => engine.destroy();
  }, []);

  const getEngine = () => engineRef.current;
  const playing = game.status === "playing";
  const target = game.largest < 128 ? 128 : game.largest < 512 ? 512 : 2048;
  const progress = Math.min(100, (game.largest / target) * 100);

  const onTouchStart = event => {
    if (game.status !== "playing") return;
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = event => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || game.status !== "playing") return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));
    const engine = getEngine();
    if (!engine) return;
    if (distance < 24) engine.hardDrop();
    else if (Math.abs(dx) > Math.abs(dy)) engine.move(dx > 0 ? 1 : -1);
    else if (dy > 0) engine.step();
  };

  return <main className="app-shell">
    <section className="brand-panel">
      <p className="eyebrow">REACT + CAPACITOR</p>
      <h1>MERGE<br /><span>DROP</span></h1>
      <p className="tagline">Solte. Combine.<br />Quebre o seu recorde.</p>
      <div className="controls-card">
        <p className="card-title">CONTROLES</p>
        <div><kbd>←</kbd><kbd>→</kbd><span>Mover</span></div>
        <div><kbd>↓</kbd><span>Acelerar</span></div>
        <div><kbd>ESPAÇO</kbd><span>Soltar</span></div>
        <div><kbd>P</kbd><span>Pausar</span></div>
        <div><kbd>R</kbd><span>Nova rodada</span></div>
      </div>
    </section>

    <section className="game-column">
      <header className="topbar">
        <Stat label="PONTOS">{format(game.score)}</Stat>
        <Stat label="RECORDE" className="record">{format(Math.max(game.best, game.score))}</Stat>
        <Stat label="MOEDAS" className="coins"><i />{format(game.coins)}</Stat>
      </header>

      <div className="game-frame" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <canvas ref={canvasRef} width="540" height="900" aria-label="Área do jogo Merge Drop" />
        <div className={`fever-hud ${game.turbo ? "active" : ""}`}>
          <div><span>RITMO</span><b>{game.streak}×</b></div>
          <div className="fever-track"><i style={{ width: `${game.turbo ? 100 : game.fever}%` }} /></div>
          <small>{game.turbo ? `TURBO ${game.turbo}s` : "encha com fusões"}</small>
        </div>
        {game.status === "idle" && <Overlay><p className="mini-label">PRONTO?</p><h2>Faça blocos<br />gigantes.</h2><p>Una números iguais antes que a pilha alcance o topo.</p><button className="primary" onClick={() => getEngine()?.start()}>JOGAR AGORA <span>→</span></button></Overlay>}
        {game.status === "paused" && <Overlay><p className="mini-label">PAUSADO</p><h2>Respira.</h2><button className="primary" onClick={() => getEngine()?.resume()}>CONTINUAR</button></Overlay>}
        {game.status === "gameover" && <Overlay>
          <p className="mini-label">FIM DA JOGADA</p>
          <h2>{game.newRecord ? "NOVO RECORDE!" : "QUASE!"}</h2>
          <div className="final-score"><span>SEUS PONTOS</span><strong>{format(game.score)}</strong></div>
          <div className="run-stats"><div><span>MAIOR BLOCO</span><b>{game.largest}</b></div><div><span>MAIOR COMBO</span><b>{game.maxChain}×</b></div><div><span>TEMPO</span><b>{game.time}</b></div></div>
          <p>{game.newRecord ? "Essa merece outra rodada." : `Faltaram ${format(Math.max(0, game.best - game.score))} pontos para o recorde.`}</p>
          {!game.continued && <><button className="primary" onClick={() => getEngine()?.rewardedContinue()}>▶ VER ANÚNCIO E CONTINUAR <small>simulação do protótipo</small></button><button className="secondary" disabled={game.coins < 25} onClick={() => getEngine()?.coinContinue()}>USAR <b>25</b> MOEDAS</button></>}
          <button className={game.continued ? "primary" : "text-button"} onClick={() => getEngine()?.start()}>JOGAR DE NOVO · R</button>
        </Overlay>}
      </div>

      <nav className="touch-controls" aria-label="Controles de toque">
        <button type="button" aria-label="Mover para esquerda" onClick={() => getEngine()?.move(-1)}>←</button>
        <button type="button" aria-label="Acelerar peça" onClick={() => getEngine()?.step()}>↓</button>
        <button type="button" aria-label="Mover para direita" onClick={() => getEngine()?.move(1)}>→</button>
        <button type="button" className="drop-control" aria-label="Soltar peça" onClick={() => getEngine()?.hardDrop()}>SOLTAR</button>
        <button type="button" aria-label="Pausar jogo" onClick={() => getEngine()?.togglePause()}>Ⅱ</button>
      </nav>

      <footer className="statusbar">
        <div><span>PRÓXIMOS</span><b className="next-queue">{game.next.map((n, i) => <i key={`${n}-${i}`}>{n}</i>)}</b></div>
        <div><span>NÍVEL</span><b>{game.level}</b></div>
        <button onClick={() => getEngine()?.toggleSound()}>SOM <b>{game.sound ? "ON" : "OFF"}</b></button>
      </footer>
      <AdsenseSlot slot={import.meta.env.VITE_ADSENSE_SLOT_GAME} />
    </section>

    <aside className="mission-panel">
      <div className="mission-card"><p className="card-title">META DA RODADA</p><strong>CRIE UM</strong><div className="target-block">{target}</div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div><small>Melhor bloco: {game.largest}</small></div>
      <div className="tip-card"><span>{game.danger ? "PERIGO" : game.streak >= 3 ? "RITMO QUENTE" : "DICA"}</span><p>{game.danger ? "A pilha está no limite. Procure uma fusão imediata." : "Mantenha os números grandes no fundo e prepare combinações em cadeia."}</p></div>
    </aside>
  </main>;
}

function Overlay({ children }) { return <div className="overlay visible"><div className="modal">{children}</div></div>; }

export default App;
