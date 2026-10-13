/* Plegar Pro · Asistente técnico conversacional por voz v1
 * Capa de interfaz y voz para la IA técnica existente. No contiene claves ni simula
 * una conexión a un modelo remoto que no esté configurada.
 */
(function(){
  'use strict';
  if(window.PLEGAR_PRO_VOICE?.installed)return;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let recognition=null,listening=false,shouldListen=false,speaking=false,busy=false,turns=0;
  const history=[];
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const style=document.createElement('style');
  style.textContent=`
  #ppai-voice{grid-column:span 12;border:1px solid #47768d;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,#102a3b,#071722 72%);color:#edf8ff;box-shadow:0 16px 42px #0003}
  #ppai-voice *{box-sizing:border-box}
  #ppai-voice .ppai-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid #31546a;background:linear-gradient(100deg,#24475c,#102b3e 60%,#0a1d2b)}
  #ppai-voice .ppai-title{font-size:17px;font-weight:900;letter-spacing:.02em}#ppai-voice .ppai-sub{font-size:12px;color:#b5cbd8;margin-top:4px}
  #ppai-voice .ppai-live{font-size:11px;border:1px solid #3a9e88;border-radius:99px;padding:7px 10px;color:#91f2cf;white-space:nowrap}
  #ppai-voice .ppai-body{display:grid;grid-template-columns:minmax(0,1fr) 245px;gap:14px;padding:14px}
  #ppai-voice .ppai-chat{min-width:0;display:flex;flex-direction:column;gap:10px}
  #ppai-voice .ppai-log{height:300px;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:12px;border:1px solid #2d4e62;border-radius:12px;background:linear-gradient(180deg,#081925,#0b2030)}
  #ppai-voice .ppai-msg{max-width:92%;padding:10px 12px;border-radius:12px;line-height:1.5;font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere}
  #ppai-voice .ppai-msg.assistant{align-self:flex-start;background:#18384b;border:1px solid #315d73;color:#edf8ff;border-bottom-left-radius:4px}
  #ppai-voice .ppai-msg.user{align-self:flex-end;background:#d7f4ff;color:#123448;border:1px solid #87cfe8;border-bottom-right-radius:4px}
  #ppai-voice .ppai-compose{display:flex;gap:8px;align-items:stretch}#ppai-voice textarea{flex:1;min-width:0;min-height:48px;max-height:120px;resize:vertical;background:#f7fbfe;color:#173246;border:1px solid #8daebf;border-radius:10px;padding:11px}
  #ppai-voice .ppai-btn{border:1px solid #4b7b93;border-radius:10px;background:linear-gradient(145deg,#28546d,#12364d);color:#f4fbff;padding:10px 12px;font-weight:800;min-height:42px}
  #ppai-voice .ppai-btn.primary{background:linear-gradient(145deg,#3ce0bb,#13a88b);border-color:#9cf4df;color:#042e28}
  #ppai-voice .ppai-btn:disabled{opacity:.45;cursor:not-allowed}
  #ppai-voice .ppai-side{border:1px solid #2e5267;border-radius:12px;padding:12px;background:#0b1e2b;min-width:0}
  #ppai-voice .ppai-orb{width:82px;height:82px;margin:8px auto 12px;border-radius:50%;display:grid;place-items:center;font-size:29px;border:1px solid #6ce5ff;background:radial-gradient(circle at 35% 25%,#7cf0ff,#167aa2 48%,#09263b 76%);box-shadow:inset 0 0 18px #d5faff70,0 0 25px #31cfff25}
  #ppai-voice[data-listening="true"] .ppai-orb{animation:ppaiPulse 1.35s ease-in-out infinite}
  #ppai-voice .ppai-side h3{color:#edf8ff;margin:5px 0 8px;font-size:13px}
  #ppai-voice .ppai-side p,#ppai-voice .ppai-side li{color:#b4c9d7;font-size:12px;line-height:1.5}
  #ppai-voice .ppai-side ul{padding-left:18px;margin:7px 0}
  #ppai-voice .ppai-tools{display:flex;gap:7px;flex-wrap:wrap}
  #ppai-voice .ppai-tools .ppai-btn{flex:1 1 105px}
  #ppai-voice .ppai-foot{padding:10px 15px;border-top:1px solid #29485a;color:#a9c2d1;font-size:11px;line-height:1.5}
  @keyframes ppaiPulse{0%,100%{box-shadow:0 0 0 0 #38d6ff30,inset 0 0 18px #d5faff70}50%{box-shadow:0 0 0 13px #38d6ff00,inset 0 0 25px #d5faffbb}}
  @media(max-width:760px){#ppai-voice .ppai-body{grid-template-columns:minmax(0,1fr)}#ppai-voice .ppai-log{height:250px}#ppai-voice .ppai-side{display:grid;grid-template-columns:84px minmax(0,1fr);gap:8px;align-items:center}#ppai-voice .ppai-orb{grid-row:span 2;width:68px;height:68px}#ppai-voice .ppai-side .ppai-tools{grid-column:1/-1}#ppai-voice .ppai-head{align-items:flex-start;flex-direction:column}}
  @media(prefers-reduced-motion:reduce){#ppai-voice[data-listening="true"] .ppai-orb{animation:none}}
  `;
  document.head.appendChild(style);
  function mount(){
    const page=$('ai');if(!page||$('ppai-voice'))return;
    const panel=document.createElement('section');panel.id='ppai-voice';panel.dataset.listening='false';
    panel.innerHTML=`
      <div class="ppai-head"><div><div class="ppai-title">✦ PLEGAR PRO · ASISTENTE TÉCNICO CONVERSACIONAL</div><div class="ppai-sub">Voz bidireccional · contexto del proyecto · acceso a herramientas de la aplicación</div></div><span class="ppai-live" id="ppai-status">● Preparado</span></div>
      <div class="ppai-body"><div class="ppai-chat"><div class="ppai-log" id="ppai-log" role="log" aria-live="polite"><div class="ppai-msg assistant">Hola. Soy el asistente técnico de Plegar Pro. Puedes escribirme o hablarme. Puedo consultar el proyecto actual, ayudarte con cálculos y abrir módulos. Antes de fabricar, confirma siempre las cotas, el utillaje y la secuencia.</div></div>
      <div class="ppai-compose"><textarea id="ppai-input" rows="2" aria-label="Mensaje al asistente" placeholder="Dime qué pieza quieres plegar o pregunta por el proyecto…"></textarea><button class="ppai-btn primary" id="ppai-send">Enviar ↗</button></div>
      <div class="ppai-tools"><button class="ppai-btn" id="ppai-mic">🎙 Hablar continuamente</button><button class="ppai-btn" id="ppai-stop">■ Parar voz</button><button class="ppai-btn" id="ppai-clear">Limpiar conversación</button></div></div>
      <aside class="ppai-side"><div class="ppai-orb" aria-hidden="true">✦</div><div><h3>Conversación en directo</h3><p id="ppai-heard">El micrófono está apagado.</p></div><div class="ppai-tools"><button class="ppai-btn" id="ppai-speak-toggle">🔊 Voz activada</button><button class="ppai-btn" id="ppai-open-ai">Abrir IA técnica</button></div><div><h3>Atajos por voz</h3><ul><li>«Resume el proyecto»</li><li>«Calcula la propuesta»</li><li>«Abre colisiones»</li><li>«Abre gemelo digital»</li><li>«Para de escuchar»</li></ul></div></aside></div>
      <div class="ppai-foot">El micrófono requiere permiso del navegador y normalmente HTTPS. El modo de voz usa el reconocimiento y la síntesis de voz disponibles en el dispositivo. Este módulo aprovecha la IA técnica local existente; no indica que haya un modelo remoto conectado si no se configura un servicio seguro.</div>`;
    const grid=page.querySelector('.grid');if(grid)grid.appendChild(panel);else page.appendChild(panel);
    $('ppai-send').addEventListener('click',()=>sendText());
    $('ppai-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText()}});
    $('ppai-mic').addEventListener('click',toggleListen);
    $('ppai-stop').addEventListener('click',()=>{shouldListen=false;stopListening();if(window.speechSynthesis)window.speechSynthesis.cancel();speaking=false;status('Voz detenida')});
    $('ppai-clear').addEventListener('click',()=>{history.length=0;turns=0;$('ppai-log').innerHTML='';addMessage('assistant','Conversación reiniciada. El proyecto de Plegar Pro no se ha modificado.');});
    $('ppai-speak-toggle').addEventListener('click',()=>{voiceEnabled=!voiceEnabled;$('ppai-speak-toggle').textContent=voiceEnabled?'🔊 Voz activada':'🔇 Voz desactivada';if(!voiceEnabled&&window.speechSynthesis)window.speechSynthesis.cancel()});
    $('ppai-open-ai').addEventListener('click',()=>{document.querySelector('[data-page="ai"]')?.click();$('aiInput')?.focus()});
    $('ppai-mic').disabled=!SR;
    if(!SR){$('ppai-heard').textContent='Este navegador no ofrece reconocimiento de voz. Puedes conversar por texto y escuchar respuestas si la síntesis está disponible.';$('ppai-mic').textContent='🎙 Micrófono no compatible'}
    addMessage('assistant','Modo técnico conectado a la pieza de esta sesión. Para cálculos, puedo ejecutar la IA técnica integrada y mostrar su resultado.');
  }
  let voiceEnabled=true;
  function status(s){const el=$('ppai-status');if(el)el.textContent='● '+s}
  function addMessage(role,text){const log=$('ppai-log');if(!log)return;const d=document.createElement('div');d.className='ppai-msg '+(role==='user'?'user':'assistant');d.textContent=String(text);log.appendChild(d);log.scrollTop=log.scrollHeight;history.push({role,content:String(text)});if(history.length>24)history.shift()}
  function projectContext(){let s=null;try{s=typeof state!=='undefined'?state:window.state}catch(e){s=window.state}const p=s?.project||{};const b=Array.isArray(s?.bends)?s.bends:[];const order=Array.isArray(s?.bendOrder)?s.bendOrder:[];return {reference:p.reference||p.ref||p.name||'sin referencia',material:p.material||s?.development?.material||'no indicado',thickness:p.thickness??s?.development?.thickness??'no indicado',bends:Math.max(0,b.length-1),order:order.length?order.map(x=>Number(x)+1).join(', '):'orden natural',machine:p.machine||s?.machine?.name||'no seleccionada'}}
  function localAnswer(raw){
    const q=raw.toLocaleLowerCase('es');const c=projectContext();
    if(/para de escuchar|deja de escuchar|detén el micrófono|apaga el micro/.test(q)){shouldListen=false;stopListening();return 'De acuerdo. He detenido el micrófono.'}
    if(/abre (?:el módulo de )?colisiones|revisión de colisiones/.test(q)){document.querySelector('[data-page="collisions"]')?.click();return 'He abierto Revisión de colisiones. Comprueba las interferencias estimadas y recuerda que no es una certificación de seguridad.'}
    if(/abre (?:el )?(?:gemelo|máquina|máquina digital)|gemelo digital/.test(q)){document.querySelector('[data-page="machineTwin"]')?.click();return 'He abierto Máquina / Gemelo digital.'}
    if(/abre (?:programación )?2d/.test(q)){document.querySelector('[data-page="program2d"]')?.click();return 'He abierto Programación 2D.'}
    if(/abre (?:programación )?3d/.test(q)){document.querySelector('[data-page="program3d"]')?.click();return 'He abierto Programación 3D.'}
    if(/abre (?:el )?utillaje|abre herramientas/.test(q)){document.querySelector('[data-page="tooling"]')?.click();return 'He abierto Utillaje.'}
    if(/resume|resumen|datos del proyecto|qué pieza|proyecto actual/.test(q)){return 'Resumen del proyecto: referencia '+c.reference+'; material '+c.material+'; espesor '+c.thickness+' mm; '+c.bends+' pliegues; orden '+c.order+'; máquina '+c.machine+'.'}
    if(/calcula|calcular|analiza la pieza|genera una propuesta|propuesta técnica/.test(q)){
      const input=$('aiInput');if(input){input.value=raw;input.dispatchEvent(new Event('input',{bubbles:true}))}
      const btn=$('aiCalculate');if(btn){btn.click();return 'He enviado tu petición a la IA técnica integrada. Revisa el resultado que aparece en el panel de IA técnica; las medidas y la secuencia deben validarse antes de fabricar.'}
      return 'No encuentro el motor de cálculo de IA técnica en esta pantalla. Abre el módulo IA técnica y vuelve a intentarlo.'
    }
    if(/ayuda|qué puedes hacer|comandos/.test(q))return 'Puedo resumir la pieza actual, enviar una descripción al motor técnico local, abrir Programación 2D o 3D, Revisión de colisiones, Utillaje y Gemelo digital. También puedo mantener una conversación por voz mientras el navegador lo permita. Para razonamiento de modelo premium remoto, falta configurar un servicio de IA seguro.'
    if(/hola|buenos días|buenas tardes|buenas noches/.test(q))return 'Hola. Estoy aquí. Podemos revisar la pieza actual o continuar con la programación. ¿Qué necesitas hacer ahora?'
    return 'He entendido: «'+raw+'». Puedo mantener el diálogo y consultar el proyecto, pero esta instalación aún no tiene conectado un modelo conversacional remoto. Para responder con razonamiento técnico avanzado sobre cualquier pregunta, hay que configurar un endpoint seguro de IA; no voy a inventar una respuesta técnica.'
  }
  function speak(text){if(!voiceEnabled||!('speechSynthesis'in window))return;try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text));u.lang='es-ES';u.rate=1;u.pitch=1;u.onstart=()=>{speaking=true;status('Respondiendo por voz');if(listening)stopListening()};u.onend=()=>{speaking=false;if(shouldListen)setTimeout(startListening,220)};u.onerror=()=>{speaking=false;if(shouldListen)setTimeout(startListening,350)};window.speechSynthesis.speak(u)}catch(e){speaking=false}}
  function sendText(text){const input=$('ppai-input');const q=String(text??input?.value??'').trim();if(!q||busy)return;if(input)input.value='';busy=true;turns++;addMessage('user',q);if($('ppai-heard'))$('ppai-heard').textContent='Procesando turno '+turns+'…';status('Procesando');setTimeout(()=>{const a=localAnswer(q);addMessage('assistant',a);busy=false;status(shouldListen?'Escuchando continuamente':'Preparado');if($('ppai-heard'))$('ppai-heard').textContent=shouldListen?'Micrófono en modo continuo.':'Último turno completado.';speak(a);},30)}
  function stopListening(){if(recognition){try{recognition.onend=null;recognition.stop()}catch(e){}recognition=null}listening=false;const p=$('ppai-voice');if(p)p.dataset.listening='false';const b=$('ppai-mic');if(b&&SR)b.textContent='🎙 Reanudar conversación';}
  function startListening(){if(!shouldListen||!SR||speaking||listening)return;try{recognition=new SR();recognition.lang='es-ES';recognition.continuous=true;recognition.interimResults=true;recognition.maxAlternatives=1;recognition.onstart=()=>{listening=true;const p=$('ppai-voice');if(p)p.dataset.listening='true';status('Escuchando');if($('ppai-heard'))$('ppai-heard').textContent='Te escucho. Habla con naturalidad.';if($('ppai-mic'))$('ppai-mic').textContent='🎙 Micrófono activo · parar'};recognition.onresult=e=>{let finalText='';let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0]?.transcript||'';if(e.results[i].isFinal)finalText+=t;else interim+=t}if($('ppai-heard'))$('ppai-heard').textContent=finalText?'Te he oído: '+finalText:(interim?'Te escucho: '+interim:'Escuchando…');if(finalText.trim())sendText(finalText.trim())};recognition.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){shouldListen=false;status('Permiso de micrófono denegado');if($('ppai-heard'))$('ppai-heard').textContent='Permite el micrófono en los ajustes del navegador para usar la voz.'}else if(e.error!=='no-speech')status('Voz: '+e.error)};recognition.onend=()=>{listening=false;const p=$('ppai-voice');if(p)p.dataset.listening='false';if(shouldListen&&!speaking)setTimeout(startListening,300)};recognition.start()}catch(e){listening=false;status('No se pudo iniciar el micrófono');if($('ppai-heard'))$('ppai-heard').textContent='El navegador no ha podido iniciar la captura. Comprueba el permiso y vuelve a pulsar.'}}
  function toggleListen(){if(!SR)return;if(shouldListen){shouldListen=false;stopListening();status('Micrófono pausado');if($('ppai-heard'))$('ppai-heard').textContent='Micrófono apagado.'}else{shouldListen=true;startListening()}}
  window.PLEGAR_PRO_VOICE={installed:true,send:sendText,getStatus:()=>({listening,speaking,turns,voiceEnabled}),getHistory:()=>history.slice()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  const observer=new MutationObserver(()=>{if(!$('ppai-voice')&&$('ai'))mount()});observer.observe(document.documentElement,{childList:true,subtree:true});
})();