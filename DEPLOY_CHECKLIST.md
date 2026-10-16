# Checklist de publicação

## Web (Cloudflare Pages)

- [ ] Conectar o repositório Git.
- [ ] Build: `npm run build`.
- [ ] Diretório de saída: `dist`.
- [ ] Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [ ] Executar `supabase/schema.sql` no projeto Supabase.
- [ ] Testar login anônimo, ranking e modo offline.

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
