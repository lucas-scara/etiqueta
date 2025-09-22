# Preenchimento de Pedido de Exame (PDF)

1. Ative o GitHub Pages (branch `main`).
2. Suba `template.pdf` (o arquivo escaneado).
3. Ajuste `SEU_USUARIO` e `NOME_REPO` em `bookmarklet.js` e `main.js`.
4. Crie um favorito com o conteúdo de `bookmarklet.js`.
5. Na página do paciente, clique no favorito. Um PDF preenchido abrirá para impressão.

### Calibração de coordenadas
- Ative `debug:true` na chamada `__fillTemplateAndOpen` para ver uma grade.
- Ajuste as posições em `fill.js` (objeto `F`).
