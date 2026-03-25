/**
 * Golf booking module
 */
import { state } from './state.js';
import { formatDate, formatDateShort, resolvePID } from './utils.js';
import { getAgentQuickSelect } from './hotels.js';

let golfGuestIdCounter = 1;

/**
 * Initialize golf booking section
 */
export function initGolfBooking() {
  const container = document.getElementById('golf-section');
  if (!container) return;
  
  const isStandalone = !state.selectedServices.has('room');
  
  // Add agent/PID fields if standalone
  if (isStandalone) {
    const agentSection = document.createElement('div');
    agentSection.id = 'golf-agent-section';
    agentSection.innerHTML = `
      <div class="form-row" style="margin-bottom: 1rem;">
        <div class="form-group">
          <label>Agent</label>
          <input list="golfAgentList" id="golfAgent" placeholder="Select or type agent name" class="form-input">
          <datalist id="golfAgentList">
            ${getAgentQuickSelect().map(a => `<option value="${a.name}">`).join('')}
          </datalist>
        </div>
      </div>
    `;
    container.insertBefore(agentSection, container.children[1]);
  } else {
    // Add sync button if room booking exists
    const syncSection = document.createElement('div');
    syncSection.id = 'golf-sync-section';
    syncSection.innerHTML = `
      <div class="tip-box" style="margin-bottom: 1rem;">
        Guest list will be auto-filled from room booking
      </div>
      <button type="button" class="btn btn-secondary" onclick="window.app.syncGolfGuests()" style="width: 100%; margin-bottom: 1rem;">
        📋 Sync Room Guests
      </button>
    `;
    container.insertBefore(syncSection, container.children[1]);
  }
  
  // Initialize guest container
  const guestContainer = document.createElement('div');
  guestContainer.id = 'golf-guests-container';
  container.insertBefore(guestContainer, document.getElementById('golf-pax')?.parentNode?.parentNode);
  
  // Add default guest
  addGolfGuestForm();
  
  // Bind add guest button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-outline';
  addBtn.innerHTML = '<span>+</span> Add Golf Guest';
  addBtn.onclick = () => addGolfGuestForm();
  container.appendChild(addBtn);
}

/**
 * Add a golf guest form
 */
export function addGolfGuestForm() {
  const container = document.getElementById('golf-guests-container');
  if (!container) return;
  
  const id = golfGuestIdCounter++;
  state.golfGuests.push(id);
  
  const guestDiv = document.createElement('div');
  guestDiv.className = 'guest-group';
  guestDiv.id = `golfGuest-${id}`;
  guestDiv.innerHTML = `
    <div class="guest-header">
      <span class="guest-number">Guest #${id}</span>
      <button type="button" class="btn btn-danger btn-sm" onclick="window.app.removeGolfGuestForm(${id})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Old PID</label>
        <div class="pid-input-wrapper">
          <input type="text" id="golfGuestOldPID-${id}" class="pid-input" placeholder="Old PID"
                 oninput="window.app.searchPID('golfGuestOldPID-${id}', 'golfGuestNewPID-${id}', 'golfGuestName-${id}', 'golfPidInfo-${id}')">
          <span class="pid-status-icon" id="golfOldPidIcon-${id}"></span>
        </div>
      </div>
      <div class="form-group">
        <label>New PID</label>
        <div class="pid-input-wrapper">
          <input type="text" id="golfGuestNewPID-${id}" class="pid-input" placeholder="New PID"
                 oninput="window.app.searchPID('golfGuestOldPID-${id}', 'golfGuestNewPID-${id}', 'golfGuestName-${id}', 'golfPidInfo-${id}')">
          <span class="pid-status-icon" id="golfNewPidIcon-${id}"></span>
        </div>
        <div id="golfPidInfo-${id}" class="pid-info-box"></div>
      </div>
      <div class="form-group">
        <label>Guest Name</label>
        <input type="text" id="golfGuestName-${id}" placeholder="Auto-filled from PID"
               oninput="this.value = this.value.toUpperCase(); window.app.updateGolfPax()">
      </div>
    </div>
  `;
  
  container.appendChild(guestDiv);
  updateGolfPax();
  return id;
}

/**
 * Remove a golf guest form
 */
export function removeGolfGuestForm(id) {
  const guestDiv = document.getElementById(`golfGuest-${id}`);
  if (guestDiv) {
    guestDiv.remove();
    state.golfGuests = state.golfGuests.filter(gid => gid !== id);
    updateGolfPax();
  }
}

/**
 * Update golf pax count based on filled guests
 */
export function updateGolfPax() {
  const paxEl = document.getElementById('golf-pax');
  if (!paxEl) return;
  
  const filledGuests = state.golfGuests.filter(id => {
    const name = document.getElementById(`golfGuestName-${id}`)?.value?.trim();
    return name;
  }).length;
  
  if (filledGuests > 0) {
    paxEl.value = filledGuests;
  }
}

/**
 * Sync golf guests from room booking
 */
export function syncGolfGuests() {
  const container = document.getElementById('golf-guests-container');
  if (!container) return;
  
  // Clear existing guests
  container.innerHTML = '';
  state.golfGuests = [];
  
  // Sync from room guests
  state.guests.forEach((guest, id) => {
    const guestDiv = document.getElementById(`guest-${id}`);
    if (!guestDiv) return;
    
    const name = document.getElementById(`guestName-${id}`)?.value;
    const oldPID = document.getElementById(`guestOldPID-${id}`)?.value || '';
    const newPID = document.getElementById(`guestNewPID-${id}`)?.value || 'New';
    
    if (name) {
      addGolfGuestForm();
      const newId = state.golfGuests[state.golfGuests.length - 1];
      document.getElementById(`golfGuestName-${newId}`).value = name;
      document.getElementById(`golfGuestOldPID-${newId}`).value = oldPID;
      document.getElementById(`golfGuestNewPID-${newId}`).value = newPID;
    }
    
    // Sync sharers
    guest.sharers.forEach(sharerId => {
      const sharerName = document.getElementById(`sharerName-${id}-${sharerId}`)?.value;
      if (sharerName) {
        const sharerOldPID = document.getElementById(`sharerOldPID-${id}-${sharerId}`)?.value || '';
        const sharerNewPID = document.getElementById(`sharerNewPID-${id}-${sharerId}`)?.value || 'New';
        addGolfGuestForm();
        const newId = state.golfGuests[state.golfGuests.length - 1];
        document.getElementById(`golfGuestName-${newId}`).value = sharerName;
        document.getElementById(`golfGuestOldPID-${newId}`).value = sharerOldPID;
        document.getElementById(`golfGuestNewPID-${newId}`).value = sharerNewPID;
      }
    });
  });
  
  updateGolfPax();
  
  // Show success message
  if (window.app && window.app.showToast) {
    window.app.showToast('✓ Room guests synced successfully!', 'success');
  }
}

/**
 * Generate golf booking email
 */
export function generateGolfEmail() {
  const dateTime = document.getElementById('golf-datetime')?.value;
  const pax = document.getElementById('golf-pax')?.value;
  const payment = document.getElementById('golf-payment')?.value;
  const authorizer = document.getElementById('golf-authorizer')?.value || 'Jian.Xu';
  const note = document.getElementById('golf-note')?.value || 'Casino Rate (If guests show CSN membership)';
  
  if (!dateTime) {
    throw new Error('Please select date and time for golf booking');
  }
  
  let guestNames = [];
  state.golfGuests.forEach(id => {
    const name = document.getElementById(`golfGuestName-${id}`)?.value?.trim();
    const oldPID = document.getElementById(`golfGuestOldPID-${id}`)?.value?.trim() || '';
    const newPID = document.getElementById(`golfGuestNewPID-${id}`)?.value?.trim() || '';
    if (name) {
      guestNames.push(`${name} - ${resolvePID(oldPID, newPID)}`);
    }
  });
  
  if (guestNames.length === 0) {
    throw new Error('Please add at least one golf guest');
  }
  
  const dt = new Date(dateTime);
  const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = formatDateShort(dateTime.split('T')[0]);
  
  // Generate subject for standalone mode
  const isStandalone = !state.selectedServices.has('room');
  let subject = 'Golf Booking Request';
  
  if (isStandalone) {
    const agent = document.getElementById('golfAgent')?.value?.trim() || '';
    const firstId = state.golfGuests[0];
    const oldPID = document.getElementById(`golfGuestOldPID-${firstId}`)?.value?.trim() || '';
    const newPID = document.getElementById(`golfGuestNewPID-${firstId}`)?.value?.trim() || '';
    const pid = resolvePID(oldPID, newPID);
    const name = document.getElementById(`golfGuestName-${firstId}`)?.value?.trim() || '';
    if (agent && name) {
      subject = `[${agent}] ${pid} ${name} Golf Booking ${date}`;
    }
  }
  
  return `Subject: ${subject}

Dear @The Bluffs Ho Tram - Bookings

Guest's name:

${guestNames.join('\n')}

Date & Time: ${date} ${time}

No. of pax: ${pax}

Note: ${note}

Payment: ${payment}

Authorizer: ${authorizer}

Thank you`;
}

// Export to window
window.app.removeGolfGuestForm = removeGolfGuestForm;
window.app.updateGolfPax = updateGolfPax;
window.app.syncGolfGuests = syncGolfGuests;
