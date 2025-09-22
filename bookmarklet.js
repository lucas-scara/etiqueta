javascript:(function(){ 
  try{ 
    const byId = id => (document.getElementById(id)?.innerText||'').trim();
    const q = sel => document.querySelector(sel);

    const celularEl = q('td.u-tL[headers="C819357120429938368"]');

    const dados = { 
      nome:       byId('P11_NOM_PACIENTE_DISPLAY'),
      sobrenome:  byId('P11_SBN_PACIENTE_DISPLAY'),
      nascimento: byId('P11_DTA_NASCIMENTO_DISPLAY'),
      cns:        byId('P11_NUM_CNS_DISPLAY'),
      cpf:        byId('P11_CPF_PACIENTE_DISPLAY'),
      nomeMae:    byId('P11_NOM_MAE_DISPLAY'),
      celular:    (celularEl ? celularEl.innerText.trim() : '')
    };

    const jsonPretty = JSON.stringify(dados, null, 2);
    alert('✅ Dados coletados:\n\n' + jsonPretty);

    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(dados))));
    const url = 'https://lucas-scara.github.io/etiqueta/generator.html#d=' + encodeURIComponent(b64);

    const a=document.createElement('a'); 
    a.href=url; a.target='_blank'; a.rel='noopener'; 
    document.body.appendChild(a); a.click(); a.remove(); 
  }catch(e){ 
    alert('Bookmarklet falhou: ' + (e && e.message ? e.message : e)); 
  } 
})();
