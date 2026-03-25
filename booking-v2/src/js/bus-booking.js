/**
 * Bus service module
 */
import { state } from './state.js';
import { formatDateShort, resolvePID } from './utils.js';
import { getAgentQuickSelect } from './hotels.js';

/**
 * Initialize bus service section
 */
export function initBusService() {
  const container = document.getElementById('bus-section');
  if (!container) return;
  
  const isStandalone = !state.selectedServices.has('room');
  
  // Add agent/PID fields if standalone
  if (isStandalone) {
    const agentSection = document.createElement('div');
    agentSection.id = 'bus-agent-section';
    agentSection.innerHTML = `
      <div class="form-row" style="margin-bottom: 1rem;">
        <div class="form-group">
          <label>Agent</label>
          <input list="busAgentList" id="busAgent" placeholder="Select or type agent name" class="form-input">
          <datalist id="busAgentList">
            ${getAgentQuickSelect().map(a => `<option value="${a.name}">`).join('')}
          </datalist>
        </div>
        <div class="form-group">
          <label>Old PID</label>
          <input type="text" id="busGuestOldPID" class="pid-input" placeholder="Old PID">
        </div>
        <div class="form-group">
          <label>New PID</label>
          <input type="text" id="busGuestNewPID" class="pid-input" placeholder="New PID">
        </div>
      </div>
    `;
    container.insertBefore(agentSection, container.children[1]);
  } else {
    // Add tip if room booking exists
    const tipSection = document.createElement('div');
    tipSection.className = 'tip-box';
    tipSection.style.marginBottom = '1rem';
    tipSection.textContent = 'Passenger name will be auto-filled from room booking';
    container.insertBefore(tipSection, container.children[1]);
  }
  
  // Bind route toggle buttons
  const hcmToHtBtn = document.getElementById('btn-hcm-ht');
  const htToHcmBtn = document.getElementById('btn-ht-hcm');
  
  if (hcmToHtBtn) {
    hcmToHtBtn.addEventListener('click', () => toggleRoute('hcmToHt'));
  }
  if (htToHcmBtn) {
    htToHcmBtn.addEventListener('click', () => toggleRoute('htToHcm'));
  }
  
  // Auto-fill passenger name if room booking exists
  if (!isStandalone) {
    const firstGuestName = document.getElementById('guestName-1')?.value;
    if (firstGuestName) {
      const passengerInput = document.getElementById('bus-passenger');
      if (passengerInput) passengerInput.value = firstGuestName;
    }
  }
}

/**
 * Toggle bus route
 */
export function toggleRoute(route) {
  state.busRoutes[route] = !state.busRoutes[route];
  
  const formId = route === 'hcmToHt' ? 'bus-form-hcm-ht' : 'bus-form-ht-hcm';
  const btnId = route === 'hcmToHt' ? 'btn-hcm-ht' : 'btn-ht-hcm';
  
  const form = document.getElementById(formId);
  const btn = document.getElementById(btnId);
  
  if (form) {
    form.style.display = state.busRoutes[route] ? 'block' : 'none';
  }
  if (btn) {
    btn.classList.toggle('active', state.busRoutes[route]);
  }
}

/**
 * Generate bus service email
 */
export function generateBusEmail() {
  const passenger = document.getElementById('bus-passenger')?.value;
  const authorizer = document.getElementById('bus-authorizer')?.value || 'Jian.Xu';
  
  if (!passenger) {
    throw new Error('Please enter passenger name');
  }
  
  if (!state.busRoutes.hcmToHt && !state.busRoutes.htToHcm) {
    throw new Error('Please select at least one route');
  }
  
  let routes = [];
  
  if (state.busRoutes.hcmToHt) {
    const time = document.getElementById('time-hcm-ht')?.value || '12:00 pm';
    const date = document.getElementById('date-hcm-ht')?.value;
    const seats = document.getElementById('seats-hcm-ht')?.value || '5';
    
    if (!date) throw new Error('Please select date for HCM → HT route');
    
    routes.push({
      route: 'HCM to HT',
      time: time,
      date: formatDateShort(date),
      seats: seats
    });
  }
  
  if (state.busRoutes.htToHcm) {
    const time = document.getElementById('time-ht-hcm')?.value || '14:00 pm';
    const date = document.getElementById('date-ht-hcm')?.value;
    const seats = document.getElementById('seats-ht-hcm')?.value || '5';
    
    if (!date) throw new Error('Please select date for HT → HCM route');
    
    routes.push({
      route: 'HT to HCM',
      time: time,
      date: formatDateShort(date),
      seats: seats
    });
  }
  
  // Generate subject for standalone mode
  const isStandalone = !state.selectedServices.has('room');
  let subject = 'Bus Service Request';
  
  if (isStandalone) {
    const agent = document.getElementById('busAgent')?.value?.trim() || '';
    const oldPID = document.getElementById('busGuestOldPID')?.value?.trim() || '';
    const newPID = document.getElementById('busGuestNewPID')?.value?.trim() || '';
    const pid = resolvePID(oldPID, newPID);
    const name = passenger;
    const date = routes[0]?.date || '';
    if (agent && name) {
      subject = `[${agent}] ${pid} ${name} Bus Service ${date}`;
    }
  }
  
  let routesText = routes.map(r => `
Route: ${r.route} ${r.time} ${r.date}
Seats: ${r.seats}`).join('\n');
  
  return `Subject: ${subject}

Hi @Grand Service

Please help to arrange bus seats as below:

Name: ${passenger}
${routesText}

Authorizer: ${authorizer}

Thank you`;
}

/**
 * Sync bus passenger from room booking
 */
export function syncBusPassenger() {
  if (state.selectedServices.has('room')) {
    const firstGuestName = document.getElementById('guestName-1')?.value;
    if (firstGuestName) {
      const passengerInput = document.getElementById('bus-passenger');
      if (passengerInput) passengerInput.value = firstGuestName;
    }
  }
}

// Export to window
window.app.toggleBusRoute = toggleRoute;

// Export alias for main.js
export { toggleRoute as toggleBusRoute };
