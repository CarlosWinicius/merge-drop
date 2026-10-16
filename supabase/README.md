# Configuração do banco

1. Crie um projeto no Supabase.
2. Em Authentication, habilite **Anonymous sign-ins**.
3. No SQL Editor, execute `schema.sql` inteiro.
4. Copie a URL do projeto e a chave pública `anon` para `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=ey...
```

5. Rode `npm install` e `npm run dev`.

O cliente nunca recebe a `service_role` key. O recorde é gravado por inserção de partida e atualizado por trigger; o jogador não consegue editar o próprio ranking diretamente.
