(async function(){
  try{
    // -------- Helpers básicos --------
    const q = s => document.querySelector(s);
    const textOf = el => el ? el.innerText.trim() : '';
    const onlyDigits = s => (s||'').replace(/\D+/g, '');

    const formatCPF = s => {
      const d = onlyDigits(s);
      return d.length===11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4') : (s||'');
    };
    const formatCNS = s => {
      const d = onlyDigits(s);
      return d.length===15 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{3})(\d{3})/,'$1 $2 $3 $4 $5') : (s||'');
    };
    const parseDateBR = s => {
      const m = (s||'').match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      return m ? `${m[1]}/${m[2]}/${m[3]}` : (s||'');
    };

    // -------- SEUS SELETORES (ajuste se necessário) --------
    const nome       = textOf(q('#P11_NOM_PACIENTE_DISPLAY'));
    const sobrenome  = textOf(q('#P11_SBN_PACIENTE_DISPLAY'));
    const nascimento = parseDateBR(textOf(q('#P11_DTA_NASCIMENTO_DISPLAY')));
    const cns        = formatCNS(textOf(q('#P11_NUM_CNS_DISPLAY')));
    const cpf        = formatCPF(textOf(q('#P11_CPF_PACIENTE_DISPLAY')));
    const nomeMae    = textOf(q('#P11_NOM_MAE_DISPLAY'));
    const celularEl  = document.querySelector('td.u-tL[headers="C819357120429938368"]');
    const celular    = celularEl ? celularEl.innerText.trim() : '';

    const dados = {
      nome, sobrenome, nascimento, cns, cpf, nomeMae, celular,
      // Edite estes dois campos no pop-up de impressão:
      exameSolicitado: 'Hemograma completo', 
      observacoes: 'Justificativa clínica/observações.'
    };

    // Copia JSON para debug (opcional)
    try { await navigator.clipboard.writeText(JSON.stringify(dados,null,2)); } catch(_){}

    // Carrega o preenchedor e executa
    await loadScriptOnce('https://SEU_USUARIO.github.io/NOME_REPO/fill.js');
    await window.__fillTemplateAndOpen({
      templateUrl: 'https://SEU_USUARIO.github.io/NOME_REPO/template.pdf',
      dados
    });

  } catch(e){
    alert('Erro no bookmarklet: ' + e);
  }

  // injeta script externo uma vez
  function loadScriptOnce(src){
    return new Promise((resolve,reject)=>{
      if (document.querySelector('script[data-src="'+src+'"]')) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.setAttribute('data-src', src);
      s.onload = resolve;
      s.onerror = () => reject(new Error('Falha ao carregar '+src));
      document.body.appendChild(s);
    });
  }
})();
