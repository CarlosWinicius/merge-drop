# Publicação na Play Store

## Preparado neste projeto

- React 19 + Vite para web e desktop.
- Capacitor 7 para gerar o app Android a partir do mesmo build.
- `appId`: `com.mergedrop.game`.
- `capacitor.config.ts` com `webDir: dist`.
- PWA com manifest e ícone.

## Próximos passos no computador com Android Studio

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

No Android Studio:

1. Confirmar o nome do app e o ícone final.
2. Criar um keystore de release e guardar a senha fora do repositório.
3. Gerar `Build > Generate Signed Bundle / APK > Android App Bundle`.
4. Criar o app no Google Play Console.
5. Enviar o `.aab` para o teste interno.
6. Preencher política de privacidade, classificação indicativa, público-alvo e declaração de anúncios.

A publicação final exige uma conta Google Play Console e credenciais de assinatura do proprietário. Não coloque keystore, senhas ou tokens no Git.
