# Checklist de publicação

## Web (Cloudflare Pages)

- [ ] Conectar o repositório Git.
- [ ] Build: `npm run build`.
- [ ] Diretório de saída: `dist`.
- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [ ] Executar `supabase/schema.sql` no projeto Supabase.
- [ ] Testar login anônimo, ranking e modo offline.

## Domínio wita.com.br no GitHub Pages

No Registro.br, crie os registros DNS:

- `A` para `@` → `185.199.108.153`
- `A` para `@` → `185.199.109.153`
- `A` para `@` → `185.199.110.153`
- `A` para `@` → `185.199.111.153`
- `CNAME` para `www` → `CarlosWinicius.github.io`

O arquivo `public/CNAME` já está configurado com `wita.com.br`. A propagação pode levar algum tempo.

## AdSense web

- [ ] Criar e ter aprovação da conta AdSense.
- [ ] Criar uma unidade de anúncio e copiar o Publisher ID (`ca-pub-...`) e o Slot ID.
- [ ] Cadastrar `VITE_ADSENSE_CLIENT` e `VITE_ADSENSE_SLOT_GAME` como secrets do GitHub Actions.
- [ ] Fazer novo deploy e verificar o anúncio sem usar cliques próprios.

## Container

```bash
docker compose up --build -d
```

O Docker Desktop precisa estar iniciado. Validar `http://localhost:8080/healthz` antes de publicar a imagem.

## Android / Play Store

- [ ] Instalar JDK 21 e configurar `JAVA_HOME`.
- [ ] Instalar Android Studio e Android SDK.
- [ ] Rodar `npm run cap:android:build`.
- [ ] Criar um keystore de release e guardá-lo fora do Git.
- [ ] Gerar política de privacidade e configurar a coleta de dados.
- [ ] Integrar anúncios reais apenas depois de validar consentimento e limites.
- [ ] Enviar o `.aab` para um teste fechado no Play Console.

O projeto já cria a pasta `android/` e sincroniza o build web. O que ainda depende da máquina é o JDK, o Android SDK, o keystore e a conta do Play Console.
