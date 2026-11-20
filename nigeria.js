(function () {
  'use strict';
  const zones = [
    {id:'nw', name:'North West', fr:'Nord-Ouest', hub:'Kano', states:['Jigawa','Kaduna','Kano','Katsina','Kebbi','Sokoto','Zamfara'], color:'#a86a31'},
    {id:'ne', name:'North East', fr:'Nord-Est', hub:'Gombe', states:['Adamawa','Bauchi','Borno','Gombe','Taraba','Yobe'], color:'#567c94'},
    {id:'nc', name:'North Central', fr:'Centre-Nord', hub:'Abuja', states:['Benue','Kogi','Kwara','Nasarawa','Niger','Plateau','FCT Abuja'], color:'#6a6893'},
    {id:'sw', name:'South West', fr:'Sud-Ouest', hub:'Lagos', states:['Ekiti','Lagos','Ogun','Ondo','Osun','Oyo'], color:'#008751'},
    {id:'se', name:'South East', fr:'Sud-Est', hub:'Enugu', states:['Abia','Anambra','Ebonyi','Enugu','Imo'], color:'#b05052'},
    {id:'ss', name:'South South', fr:'Sud-Sud', hub:'Port Harcourt', states:['Akwa Ibom','Bayelsa','Cross River','Delta','Edo','Rivers'], color:'#248583'}
  ];
  const zoneForState = state => zones.find(zone => zone.states.includes(state));
  async function sendVisitRequest(data, transport = fetch) {
    const response = await transport('https://formspree.io/f/xjgqdokd', {
      method:'POST', body:data, headers:{Accept:'application/json'}, signal:AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error('Request not accepted');
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {zones, zoneForState, sendVisitRequest};
  if (typeof document === 'undefined') return;
  const form = document.getElementById('cityVisitForm');
  if (!form) return;
  const S = (en, fr) => document.documentElement.lang === 'fr' ? fr : en;
  let selected = zones.find(zone => zone.id === 'sw');
  const state = form.elements.state;
  const zoneField = form.elements.zone;
  const status = document.getElementById('visitStatus');
  const submit = document.getElementById('visitSubmit');
  const zoneButtons = document.querySelectorAll('[data-zone]');
  let submissionState = 'idle';
  function renderZone() {
    document.getElementById('zoneName').textContent = S(selected.name, selected.fr);
    document.getElementById('zoneCount').textContent = selected.id === 'nc' ? '6 + FCT' : String(selected.states.length);
    document.getElementById('zoneHub').textContent = selected.hub;
    document.getElementById('zoneDetail').style.setProperty('--zone-color',selected.color);
    document.getElementById('zoneStates').replaceChildren(...selected.states.map(name => {
      const chip = document.createElement('span'); chip.textContent = name; return chip;
    }));
    zoneButtons.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.zone === selected.id)));
  }
  zoneButtons.forEach(button => button.addEventListener('click', () => {
    selected = zones.find(zone => zone.id === button.dataset.zone); renderZone();
  }));
  state.addEventListener('change', () => {
    const zone = zoneForState(state.value);
    zoneField.value = zone ? zone.name : '';
    document.getElementById('visitZone').textContent = zone ? S(zone.name,zone.fr) : S('Choose your state','Choisissez votre État');
    if (zone) {selected = zone; renderZone();}
  });
  document.getElementById('requestSelectedZone').addEventListener('click', () => {
    document.getElementById('visitState').focus({preventScroll:true});
  });
  function renderStatus() {
    submit.textContent = submissionState === 'sending' ? S('Sending…','Envoi…') : S('Request a city visit →','Demander une visite →');
    status.textContent = submissionState === 'success'
      ? S('Request sent. Our team will contact you to discuss your city. A request is not a confirmed visit.','Demande envoyée. Notre équipe vous contactera pour discuter de votre ville. La visite reste à confirmer.')
      : submissionState === 'error'
        ? S('Your request could not be confirmed. Your answers are still here. Retry or email partnership@bitkwa.org.','Votre demande n’a pas pu être confirmée. Vos réponses sont conservées. Réessayez ou écrivez à partnership@bitkwa.org.') : '';
    status.dataset.status = submissionState;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submissionState === 'sending' || !form.reportValidity()) return;
    const zone = zoneForState(state.value);
    if (!zone) {state.focus(); return;}
    zoneField.value = zone.name;
    submissionState = 'sending'; submit.disabled = true; renderStatus();
    try {
      await sendVisitRequest(new FormData(form));
      form.reset(); state.dispatchEvent(new Event('change')); submissionState = 'success';
    } catch (_) {submissionState = 'error';}
    finally {submit.disabled = false; renderStatus(); status.focus();}
  });
  new MutationObserver(() => {
    renderZone(); renderStatus();
    const zone = zoneForState(state.value);
    document.getElementById('visitZone').textContent = zone ? S(zone.name,zone.fr) : S('Choose your state','Choisissez votre État');
  }).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  renderZone();
})();
