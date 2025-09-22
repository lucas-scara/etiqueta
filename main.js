javascript:(function(){
  try{
    /* ---------- Helpers ---------- */
    const q = s => document.querySelector(s);
    const qAll = s => Array.from(document.querySelectorAll(s));
    const textOf = el => el ? el.innerText.trim() : '';

    const trySelectors = selectors => {
      for(const sel of selectors){
        const el = q(sel);
        if(el && textOf(el)) return textOf(el);
      }
      return '';
    };

    const regexSearch = (pattern) => {
      const body = document.body ? document.body.innerText : '';
      const m = body.match(pattern);
      return m ? m[1].trim() : '';
    };

    const onlyDigits = s => (s||'').replace(/\D+/g, '');

    const formatCPF = s => {
      const d = onlyDigits(s);
      if(d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
      return s || null;
    };

    const formatCNS = s => {
      const d = onlyDigits(s);
      if(d.length === 15) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/,'$1 $2 $3 $4 $5');
      return s || null;
    };

    const parseDateBRtoISO = s => {
      if(!s) return null;
      // tenta dd/mm/aaaa ou dd-mm-aaaa
      const m = s.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if(m) {
        const iso = `${m[3]}-${m[2]}-${m[1]}`;
        return iso;
      }
      // tenta aaaa-mm-dd
      const m2 = s.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
      if(m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
      // fallback: tenta extrair números
      const digits = onlyDigits(s);
      if(digits.length === 8) return `${digits.slice(4,8)}-${digits.slice(2,4)}-${digits.slice(0,2)}`;
      return s || null;
    };

    const capWords = s => (s||'').toLowerCase().split(/\s+/).map(w => w ? (w[0].toUpperCase()+w.slice(1)) : '').join(' ').trim();

    /* ---------- Extracao (tenta varios seletores) ---------- */
    const nome = trySelectors([
      '#P11_NOM_PACIENTE_DISPLAY',
      '#nomePaciente',
      '.patient-name',
      'span.nome-paciente'
    ]) || regexSearch(/Nome(?: do paciente)?:\s*([A-Za-zÀ-ÖØ-öø-ÿ\s'-]+)/i);

    const sobrenome = trySelectors([
      '#P11_SBN_PACIENTE_DISPLAY',
      '#sobrenomePaciente',
      '.patient-lastname'
    ]) || ''; // opcional

    const nascimentoRaw = trySelectors([
      '#P11_DTA_NASCIMENTO_DISPLAY',
      '#dataNascimento',
      '.nascimento'
    ]) || regexSearch(/Nasc(?:imento)?:\s*([0-9\/\-\s]+)/i);

    const cnsRaw = trySelectors([
      '#P11_NUM_CNS_DISPLAY',
      '#numCNS',
      '.cns'
    ]) || regexSearch(/CNS[:\s]*([0-9\s\-\.]{10,})/i) || '';

    const cpfRaw = trySelectors([
      '#P11_CPF_PACIENTE_DISPLAY',
      '#cpfPaciente',
      '.cpf'
    ]) || regexSearch(/CPF[:\s]*([0-9\.\-]{11,})/i) || '';

    const nomeMae = trySelectors([
      '#P11_NOM_MAE_DISPLAY',
      '#nomeMae',
      '.mae'
    ]) || regexSearch(/M[äa]e[:\s]*([A-Za-zÀ-ÖØ-öø-ÿ\s'-]+)/i) || '';

    // exemplo de seletor custom (você tinha um td com headers)
    const celularEl = q('td.u-tL[headers="C819357120429938368"]') || q('td[headers*="cel"]') || q('.telefone') || null;
    const celular = celularEl ? textOf(celularEl) : (regexSearch(/(Cel(?:ular)?|Telefone)[:\s]*([\d\(\)\s\-\+]{8,})/i) || '');

    /* ---------- Normalizacoes ---------- */
    const nascimento = parseDateBRtoISO(nascimentoRaw);
    const cpf = formatCPF(cpfRaw);
    const cns = formatCNS(cnsRaw);

    const dados = {
      nome: capWords(nome || null),
      sobrenome: capWords(sobrenome || null),
      nascimento_iso: nascimento,
      nascimento_br: nascimento ? (new Date(nascimento)).toLocaleDateString('pt-BR') : (nascimentoRaw || null),
      cns,
      cpf,
      nomeMae: capWords(nomeMae || null),
      celular: celular || null,
      extra_raw: {
        nascimento_raw: nascimentoRaw,
        cpf_raw: cpfRaw,
        cns_raw: cnsRaw
      }
    };

    /* ---------- Copia JSON para clipboard ---------- */
    const output = JSON.stringify(dados, null, 2);
    navigator.clipboard.writeText(output).catch(()=>{ /* silent */ });

    /* ---------- Template de Pedido de Exame (gera nova janela imprimível) ---------- */
    const examTemplate = ({dados}) => {
      const now = new Date();
      const header = `<h1 style="margin:0;font-size:18px">Hospital / Clínica</h1>
        <div style="font-size:12px;margin-top:4px">Pedido de Solicitação de Exame</div>`;
      return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pedido de Exame - ${dados.nome || ''}</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:20px}
          .card{border:1px solid #ddd;padding:16px;border-radius:6px;max-width:800px}
          .row{display:flex;gap:16px;margin-bottom:8px}
          .col{flex:1}
          .label{font-size:12px;color:#666}
          .value{font-size:14px;margin-top:4px}
          .hr{height:1px;background:#eee;margin:12px 0}
          .footer{font-size:12px;color:#444;margin-top:18px}
          @media print { button { display:none } }
        </style>
      </head>
      <body>
        <div class="card">
          ${header}
          <div style="height:12px"></div>
          <div class="row">
            <div class="col">
              <div class="label">Paciente</div>
              <div class="value"><strong>${dados.nome || ''} ${dados.sobrenome || ''}</strong></div>
            </div>
            <div class="col">
              <div class="label">Data de Nascimento</div>
              <div class="value">${dados.nascimento_br || ''}</div>
            </div>
            <div class="col">
              <div class="label">CPF</div>
              <div class="value">${dados.cpf || ''}</div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="label">CNS</div>
              <div class="value">${dados.cns || ''}</div>
            </div>
            <div class="col">
              <div class="label">Nome da Mãe</div>
              <div class="value">${dados.nomeMae || ''}</div>
            </div>
            <div class="col">
              <div class="label">Celular</div>
              <div class="value">${dados.celular || ''}</div>
            </div>
          </div>

          <div class="hr"></div>

          <div>
            <div class="label">Exame Solicitado</div>
            <div class="value">
              <!-- O local abaixo é editável — substitua conforme necessário -->
              <textarea id="exameSolicitado" style="width:100%;height:90px;font-size:14px;padding:8px">[Descreva aqui o exame solicitado — ex: Hemograma completo, Glicemia em jejum, Tempo de Protrombina...]</textarea>
            </div>
          </div>

          <div style="margin-top:12px">
            <div class="label">Justificativa / Observações</div>
            <div class="value"><textarea id="observacoes" style="width:100%;height:70px;padding:8px">[Observações clínicas / justificativa do pedido]</textarea></div>
          </div>

          <div class="hr"></div>

          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div class="label">Assinatura do Solicitante</div>
              <div class="value">Dr(a). _______________________</div>
            </div>
            <div style="text-align:right">
              <div class="label">Data do Pedido</div>
              <div class="value">${now.toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div class="footer">
            Este documento foi gerado automaticamente. Verifique os dados do paciente antes de imprimir ou anexar ao prontuário.
          </div>

          <div style="margin-top:12px;display:flex;gap:8px">
            <button onclick="(function(){ document.execCommand('copy'); navigator.clipboard.writeText(JSON.stringify({exame:document.getElementById('exameSolicitado').value, observacoes:document.getElementById('observacoes').value, paciente:${JSON.stringify(dados)}}, null, 2)).then(()=>alert('JSON copiado'))})()">Copiar JSON do pedido</button>
            <button onclick="window.print()">Imprimir / Salvar como PDF</button>
          </div>
        </div>
      </body>
      </html>`;
    };

    const win = window.open('','_blank','noopener');
    win.document.write(examTemplate({dados}));
    win.document.close();

    alert('✅ Dados extraídos e JSON copiado (tentativa).\nA janela do pedido de exame foi aberta para revisão e impressão.');

  } catch(e){
    alert('Erro no bookmarklet: ' + e);
  }
})();
