// fill.js
// Requer pdf-lib do CDN
// Você pode fixar versão: https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js
(async function ensurePdfLib(){
  if (!window.PDFLib) {
    await new Promise((res, rej)=>{
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/pdf-lib/dist/pdf-lib.min.js';
      s.onload = res; s.onerror = () => rej(new Error('pdf-lib não carregou'));
      document.head.appendChild(s);
    });
  }
})();

window.__fillTemplateAndOpen = async function({ templateUrl, dados, debug=false }){
  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;

  // 1) Carrega template
  const arrayBuf = await fetch(templateUrl, {cache:'no-store'}).then(r=>r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(arrayBuf);
  const page = pdfDoc.getPage(0);
  const { width, height } = page.getSize();

  // 2) Fonte
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 3) Mapa de campos -> coordenadas (EXEMPLO! Ajuste essas posições)
  // Use o modo "debug grid" abaixo para calibrar rapidamente.
  const F = {
    // label: { x, y, size, bold, value }
    nomeCompleto: { x: 120, y: height-140, size: 11, bold:true, value: `${dados.nome||''} ${dados.sobrenome||''}` },
    nascimento:   { x: 120, y: height-160, size: 11, value: dados.nascimento||'' },
    cpf:          { x: 120, y: height-180, size: 11, value: dados.cpf||'' },
    cns:          { x: 120, y: height-200, size: 11, value: dados.cns||'' },
    nomeMae:      { x: 120, y: height-220, size: 11, value: dados.nomeMae||'' },
    celular:      { x: 120, y: height-240, size: 11, value: dados.celular||'' },

    exameSolicitado: { x: 120, y: height-320, size: 11, value: dados.exameSolicitado||'' },
    observacoes:     { x: 120, y: height-360, size: 11, value: dados.observacoes||'' },

    dataHoje:     { x: width-150, y: 80, size: 11, value: new Date().toLocaleDateString('pt-BR') },
  };

  // 4) (Opcional) modo grade para calibrar
  if (debug) {
    const step = 20;
    for (let x=0; x<=width; x+=step){
      page.drawLine({ start: {x, y:0}, end:{x, y:height}, thickness:0.2, color: rgb(0.9,0.9,0.9) });
      page.drawText(String(x), { x, y: height-10, size: 6, font });
    }
    for (let y=0; y<=height; y+=step){
      page.drawLine({ start: {x:0, y}, end:{x:width, y}, thickness:0.2, color: rgb(0.9,0.9,0.9) });
      page.drawText(String(y), { x: 2, y, size: 6, font });
    }
  }

  // 5) Desenha os campos
  const draw = (cfg)=>{
    if (!cfg?.value) return;
    page.drawText(String(cfg.value), {
      x: cfg.x, y: cfg.y,
      size: cfg.size || 11,
      font: cfg.bold ? fontBold : font,
      color: rgb(0,0,0)
    });
  };
  Object.values(F).forEach(draw);

  // 6) Salva e abre em nova aba (Blob URL) — menos suscetível a bloqueio de pop-up
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  // abre com link programático
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 30000);
};
