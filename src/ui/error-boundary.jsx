import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="app-shell"><section className="brand-panel"><p className="eyebrow">MERGE DROP</p><h1>Algo deu<br /><span>errado.</span></h1><p className="tagline">Recarregue a página para iniciar uma nova partida.</p><button className="primary" onClick={() => window.location.reload()}>RECARREGAR</button></section></main>;
  }
}
