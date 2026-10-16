# Merge Drop — React + Capacitor

Esta é a nova base multiplataforma do jogo. A interface foi recriada em React e o motor do canvas fica isolado em `src/game-engine.js`, permitindo usar o mesmo gameplay na web, no PC e no Android.

## Rodar no PC

```bash
npm install
npm run dev
```

Para criar o build de produção:

```bash
npm run build
```

O `package-lock.json` fixa as versões instaladas e a CI em `.github/workflows/ci.yml` valida o build web e o container antes de aceitar alterações na branch principal.

## Android / Play Store

Leia `PLAYSTORE.md`. O fluxo usa Capacitor e gera um Android App Bundle (`.aab`) para o Google Play Console. É necessário Android Studio, JDK, uma conta Play Console e um keystore de release.

Veja também `DEPLOY_CHECKLIST.md` para os passos que ainda dependem de contas e ferramentas externas.

## Estrutura

- `ARCHITECTURE.md`: decisões de camadas e pontos de extensão.
- `src/App.jsx`: interface React e HUD.
- `src/application/create-game-session.js`: composição das dependências da partida.
- `src/game-engine.js`: regras, canvas, teclado, pontuação, TURBO e recordes.
- `src/config/runtime.js`: configuração de runtime e plataforma.
- `src/infrastructure/storage/local-game-storage.js`: armazenamento local com fallback offline.
- `src/app.css`: identidade visual neon da referência.
- `capacitor.config.json`: identidade do aplicativo Android.
- `PLAYSTORE.md`: checklist de publicação.
- `supabase/schema.sql`: tabelas, trigger de recorde, leaderboard e RLS.
- `src/lib/cloud-sync.js`: adaptador de sincronização opcional; sem credenciais o jogo permanece offline.

O projeto não contém anúncios reais, credenciais ou keystore.

## Banco de dados

Copie `.env.example` para `.env`, preencha as variáveis do Supabase e execute `supabase/schema.sql` no SQL Editor. O app usa autenticação anônima para não bloquear a primeira partida e envia uma partida ao banco somente quando a conexão estiver configurada. Sem conexão, recordes e moedas continuam no armazenamento local.

## Container

O front pode ser servido em um container Nginx:

```bash
docker compose up --build -d
```

Abra `http://localhost:8080`. O endpoint `http://localhost:8080/healthz` retorna `ok`. O banco permanece no Supabase; o container não guarda dados do jogador.

Para um deploy Docker no Render, o arquivo `render.yaml` já define o serviço e o health check. Para produção web estática, use Cloudflare Pages com build `npm run build` e saída `dist`.

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente a versão web no GitHub Pages a cada push na branch `main`.

O domínio personalizado `wita.com.br` é publicado pelo arquivo `public/CNAME`. No Registro.br, aponte o domínio raiz para os IPs do GitHub Pages e `www` para `CarlosWinicius.github.io`.
