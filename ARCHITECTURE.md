# Arquitetura do Merge Drop

O projeto usa uma arquitetura simples em camadas para manter a mesma partida na web, no PC e no Android.

```text
UI React (src/App.jsx)
        ↓ publica estado e comandos
Application (src/application)
        ↓ injeta dependências
Domain/game (src/game-engine.js)
        ↓ interfaces/adaptadores
Infrastructure (storage + Supabase)
```

## Responsabilidades

- `src/App.jsx`: renderização, acessibilidade e eventos da interface. Não acessa `localStorage` nem Supabase diretamente.
- `src/application/create-game-session.js`: composition root; monta o motor com os adaptadores corretos para o ambiente.
- `src/game-engine.js`: regras da partida, pontuação, colisão e desenho no canvas. Recebe armazenamento e plataforma por injeção.
- `src/config/runtime.js`: configuração de ambiente e detecção web/Android em um único lugar.
- `src/infrastructure/storage/local-game-storage.js`: persistência local com fallback em memória, útil para modo privado/offline.
- `src/lib/cloud-sync.js`: adaptador opcional do Supabase. Se não houver variáveis de ambiente, o jogo continua offline.

## Por que essa divisão ajuda

- O gameplay pode ser testado sem React ou banco.
- A troca de Supabase por outro backend não exige alterar a tela.
- O mesmo build pode ser servido pelo Cloudflare Pages ou dentro do container Nginx.
- Falha de rede, bloqueio de armazenamento ou modo offline não derruba a partida.

## Próximas extensões seguras

1. Adicionar testes unitários para `MergeDropEngine` usando um storage em memória.
2. Criar um adaptador de anúncios em `src/infrastructure/ads`, mantendo o engine sem SDK de publicidade.
3. Criar um adaptador de compras em `src/infrastructure/billing` somente no Android.
4. Adicionar CI para `npm ci`, `npm run build` e validação do Docker antes do deploy.
