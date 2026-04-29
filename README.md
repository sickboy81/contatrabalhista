<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Conta Trabalhista

Aplicação React + Vite com calculadoras e ferramentas trabalhistas.

## Rodar localmente

1. Instale dependências:
   `npm install`
2. Inicie em desenvolvimento:
   `npm run dev`

## Scripts úteis

- `npm run lint`: checagem TypeScript (`tsc --noEmit`)
- `npm run generate:sitemap`: gera `public/sitemap.xml` automaticamente a partir das rotas do `App.tsx`
- `npm run build`: gera sitemap e faz build de produção
- `npm run prerender`: gera HTML prerenderizado das rotas em `dist/<rota>/index.html`
- `npm run validate:seo`: valida host canônico no sitemap e referência no robots
- `npm run build:seo`: fluxo completo de SEO técnico (build + prerender + validação)
