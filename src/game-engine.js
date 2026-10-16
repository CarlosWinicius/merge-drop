const COLS = 6;
const ROWS = 10;
const COLORS = { 2: [200,255,54], 4: [61,229,255], 8: [161,111,255], 16: [255,107,159], 32: [255,120,61], 64: [255,209,74], 128: [72,241,170], 256: [255,74,74], 512: [105,137,255], 1024: [239,235,219], 2048: [255,233,101] };
const color = value => `rgb(${(COLORS[Math.min(2048, value)] || COLORS[2048]).join(",")})`;
const empty = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export class MergeDropEngine {
  constructor(canvas, publish, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.publish = publish;
    this.storage = options.storage || { getNumber: () => 0, getBoolean: () => true, set: () => {} };
    this.platform = options.platform || "web";
    this.onRunEnd = options.onRunEnd;
    this.best = this.storage.getNumber("mergeDrop:best");
    this.coins = this.storage.getNumber("mergeDrop:coins");
    this.sound = this.storage.getBoolean("mergeDrop:sound", true);
    this.keydown = event => this.onKey(event);
    document.addEventListener("keydown", this.keydown);
    this.state = { status: "idle", score: 0, best: this.best, coins: this.coins, level: 1, next: [2,4,2], fever: 0, streak: 0, largest: 2, sound: this.sound };
    this.board = empty(); this.particles = []; this.last = performance.now(); this.drawFrame();
    this.loop = requestAnimationFrame(this.tick);
  }

  tick = now => {
    const dt = Math.min(60, now - this.last); this.last = now;
    if (this.state.status === "playing" && this.active && !this.paused) {
      this.fall += dt;
      if (this.fall > Math.max(235, 880 - (this.state.level - 1) * 82)) { this.fall = 0; this.step(); }
    }
    if (this.turboUntil && now >= this.turboUntil) { this.turboUntil = 0; this.sync(); }
    this.drawFrame(); this.loop = requestAnimationFrame(this.tick);
  };

  randomValue = () => { const r = Math.random(); return this.state.score > 2500 && r < .18 ? 8 : r < .5 ? 4 : 2; };
  start = () => { this.board = empty(); this.score = 0; this.largest = 2; this.level = 1; this.maxChain = 0; this.streak = 0; this.fever = 0; this.turboUntil = 0; this.continued = false; this.started = performance.now(); this.queue = [this.randomValue(), this.randomValue(), this.randomValue()]; this.state = { ...this.state, status: "playing", score: 0, level: 1, largest: 2, streak: 0, fever: 0, turbo: 0, continued: false, newRecord: false }; this.spawn(); this.sync(); };
  spawn = () => { this.active = { col: 3, row: 0, value: this.queue.shift() }; this.queue.push(this.randomValue()); this.fall = 0; if (this.board[0][this.active.col]) this.gameOver(); this.sync(); };
  can = (dc, dr) => { const c = this.active.col + dc, r = this.active.row + dr; return c >= 0 && c < COLS && r >= 0 && r < ROWS && !this.board[r][c]; };
  move = dc => { if (this.state.status === "playing" && this.active && this.can(dc, 0)) this.active.col += dc; };
  step = () => { if (!this.active) return; if (this.can(0, 1)) this.active.row++; else this.lock(); };
  hardDrop = () => { if (!this.active) return; while (this.can(0, 1)) this.active.row++; this.lock(); };
  lock = () => { if (!this.active) return; const { row, col } = this.active; this.board[row][col] = this.active.value; this.active = null; this.resolve(row, col); if (this.state.status === "playing") this.spawn(); };
  resolve = (row, col) => {
    let chain = 0;
    for (;;) {
      this.compact(); const value = this.board[row]?.[col]; if (!value) break;
      const neighbours = [[row+1,col],[row,col-1],[row,col+1],[row-1,col]];
      const match = neighbours.find(([r,c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS && this.board[r][c] === value);
      if (!match) break;
      this.board[match[0]][match[1]] = 0; this.board[row][col] = value * 2; chain++; this.largest = Math.max(this.largest, value * 2);
      const multiplier = this.turboUntil > performance.now() ? 2 : 1; this.score += value * 2 * chain * multiplier; this.coins += chain; this.compact();
    }
    if (!chain) { this.score += 2; this.streak = 0; } else { this.streak++; this.maxChain = Math.max(this.maxChain, chain); this.fever = Math.min(100, this.fever + chain * 23 + this.streak * 2); if (this.fever >= 100) { this.fever = 0; this.turboUntil = performance.now() + 8000; } }
    this.level = this.score < 250 ? 1 : this.score < 700 ? 2 : this.score < 1500 ? 3 : this.score < 3000 ? 4 : 5 + Math.floor((this.score - 3000) / 2000); this.persist(); this.sync();
  };
  compact = () => { for (let c = 0; c < COLS; c++) { const values = []; for (let r = ROWS - 1; r >= 0; r--) if (this.board[r][c]) values.push(this.board[r][c]); for (let r = ROWS - 1, i = 0; r >= 0; r--, i++) this.board[r][c] = values[i] || 0; } };
  gameOver = () => { const newRecord = this.score > this.best; if (newRecord) this.best = this.score; this.state.status = "gameover"; this.state.newRecord = newRecord; this.persist(); this.sync(); this.onRunEnd?.({ score: this.score, largest: this.largest, maxChain: this.maxChain, durationSeconds: (performance.now() - this.started) / 1000, level: this.level }); };
  continue = kind => { if (this.state.status !== "gameover" || this.continued) return; if (kind === "coins" && this.coins < 25) return; if (kind === "coins") this.coins -= 25; this.continued = true; for (let r = 0; r < 3; r++) this.board[r].fill(0); this.compact(); this.state.status = "playing"; this.spawn(); this.persist(); this.sync(); };
  coinContinue = () => this.continue("coins");
  rewardedContinue = () => this.continue("ad");
  resume = () => { this.paused = false; this.state.status = "playing"; this.sync(); };
  togglePause = () => { if (this.state.status === "playing") { this.paused = !this.paused; this.state.status = this.paused ? "paused" : "playing"; this.sync(); } };
  toggleSound = () => { this.sound = !this.sound; this.storage.set("mergeDrop:sound", this.sound ? "on" : "off"); this.sync(); };
  onKey = event => { if (["ArrowLeft","ArrowRight","ArrowDown","Space"].includes(event.code)) event.preventDefault(); if (event.code === "ArrowLeft" || event.code === "KeyA") this.move(-1); if (event.code === "ArrowRight" || event.code === "KeyD") this.move(1); if (event.code === "ArrowDown" || event.code === "KeyS") this.step(); if (event.code === "Space") this.hardDrop(); if (event.code === "KeyP" || event.code === "Escape") this.togglePause(); if (!this.active && (event.code === "KeyR" || event.code === "Enter")) this.start(); };
  persist = () => { this.storage.set("mergeDrop:best", this.best); this.storage.set("mergeDrop:coins", this.coins); };
  sync = () => { const danger = this.board.some((row, index) => index < 3 && row.some(Boolean)); this.publish({ ...this.state, score: this.score || 0, best: this.best, coins: this.coins, level: this.level || 1, next: this.queue || [2,4,2], largest: this.largest || 2, streak: this.streak || 0, fever: this.fever || 0, turbo: this.turboUntil ? Math.max(1, Math.ceil((this.turboUntil - performance.now()) / 1000)) : 0, sound: this.sound, continued: this.continued, danger, maxChain: this.maxChain || 0, time: time(((performance.now() - (this.started || performance.now())) / 1000)) }); };
  destroy = () => { cancelAnimationFrame(this.loop); document.removeEventListener("keydown", this.keydown); };
  drawFrame = () => { const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, cw = w / COLS, ch = h / ROWS; ctx.fillStyle = "#141722"; ctx.fillRect(0,0,w,h); ctx.strokeStyle = "rgba(255,255,255,.055)"; for (let c=0;c<=COLS;c++){ctx.beginPath();ctx.moveTo(c*cw,0);ctx.lineTo(c*cw,h);ctx.stroke();} for(let r=0;r<=ROWS;r++){ctx.beginPath();ctx.moveTo(0,r*ch);ctx.lineTo(w,r*ch);ctx.stroke();} for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(this.board[r][c])this.block(c,r,this.board[r][c],cw,ch,1); if(this.active){let gr=this.active.row;while(gr+1<ROWS&&this.can(0,gr+1-this.active.row))gr++;if(gr!==this.active.row)this.block(this.active.col,gr,this.active.value,cw,ch,.16);this.block(this.active.col,this.active.row,this.active.value,cw,ch,1);} };
  block = (c,r,v,cw,ch,alpha) => { const ctx=this.ctx,p=Math.max(5,cw*.065),x=c*cw+p,y=r*ch+p,bw=cw-p*2,bh=ch-p*2;ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color(v);ctx.shadowColor=color(v);ctx.shadowBlur=alpha>.5?16:0;ctx.beginPath();ctx.roundRect(x,y,bw,bh,12);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle="rgba(0,0,0,.16)";ctx.fillRect(x,y+bh-8,bw,8);ctx.fillStyle="#090b11";ctx.font=`${v>=100?28:34}px Arial Black`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(v,x+bw/2,y+bh/2-2);ctx.restore(); };
}
