/**
 * Car service module
 */
import { state } from './state.js';
import { formatDateShort, resolvePID } from './utils.js';
import { getAgentQuickSelect } from './hotels.js';

let carIdCounter = 1;

/**
 * Initialize car service section
 */
export function initCarService() {
  // Check if standalone mode (no room booking)
  const isStandalone = !state.selectedServices.has('room');
  
  // Show tip if combined with room booking
  const tipEl = document.getElementById('car-tip');
  if (tipEl && !isStandalone) {
    tipEl.style.display = 'block';
  }
  
  // Add agent selector if standalone
  if (isStandalone) {
    const section = document.getElementById('car-section');
    if (section) {
      const agentDiv = document.createElement('div');
      agentDiv.className = 'form-row';
      agentDiv.style.marginBottom = '1rem';
      agentDiv.innerHTML = `
        <div class="form-group">
          <label>Agent</label>
          <input list="carAgentList" id="carAgent" placeholder="Select or type agent name" class="form-input" onclick="this.select()">
          <datalist id="carAgentList">
            ${getAgentQuickSelect().map(a => `<option value="${a.name}">`).join('')}
          </datalist>
        </div>
      `;
      section.insertBefore(agentDiv, document.getElementById('cars-container'));
    }
  }
  
  // Add first car by default
  addCarForm();
  
  // Bind add car button
  const addBtn = document.getElementById('btn-add-car');
  if (addBtn) {
    addBtn.onclick = () => addCarForm();
  }
}

/**
 * Add a car form
 */
export function addCarForm() {
  const container = document.getElementById('cars-container');
  if (!container) return;
  
  const id = carIdCounter++;
  state.cars.set(id, { id });
  
  const isStandalone = !state.selectedServices.has('room');
  const checkInDate = document.getElementById('checkIn')?.value || new Date().toISOString().split('T')[0];
  
  // Auto-fill name from room booking if available
  let autoFilledName = '';
  if (!isStandalone) {
    const firstGuestName = document.getElementById('guestName-1')?.value;
    if (firstGuestName) autoFilledName = firstGuestName;
  }
  
  const carDiv = document.createElement('div');
  carDiv.className = 'item-group';
  carDiv.id = `car-${id}`;
  carDiv.innerHTML = `
    <div class="item-header">
      <span class="item-number">Car #${id}</span>
      <button type="button" class="btn btn-danger btn-sm" onclick="window.app.removeCarForm(${id})">Remove</button>
    </div>
    ${isStandalone ? `
    <div class="form-row">
      <div class="form-group">
        <label>Old PID</label>
        <div class="pid-input-wrapper">
          <input type="text" id="carOldPID-${id}" class="pid-input" placeholder="Old PID"
                 oninput="window.app.searchPID('carOldPID-${id}', 'carNewPID-${id}', 'carName-${id}', 'carPidInfo-${id}')">
          <span class="pid-status-icon"></span>
        </div>
      </div>
      <div class="form-group">
        <label>New PID</label>
        <div class="pid-input-wrapper">
          <input type="text" id="carNewPID-${id}" class="pid-input" placeholder="New PID"
                 oninput="window.app.searchPID('carOldPID-${id}', 'carNewPID-${id}', 'carName-${id}', 'carPidInfo-${id}')">
          <span class="pid-status-icon"></span>
        </div>
        <div id="carPidInfo-${id}" class="pid-info-box"></div>
      </div>
      <div class="form-group">
        <label>Guest Name</label>
        <input type="text" id="carName-${id}" value="${autoFilledName}" placeholder="Auto-filled from PID" class="form-input">
      </div>
    </div>
    ` : `
    <div class="form-row">
      <div class="form-group">
        <label>Guest Name</label>
        <input type="text" id="carName-${id}" value="${autoFilledName}" class="form-input">
      </div>
    </div>
    `}
    <div class="form-row">
      <div class="form-group">
        <label>Car Type</label>
        <select id="carType-${id}" class="form-input">
          <option value="limo">Limo</option>
          <option value="sedan">Sedan</option>
          <option value="SUV">SUV</option>
        </select>
      </div>
      <div class="form-group">
        <label>Number of Guests</label>
        <input type="number" id="carGuests-${id}" value="4" class="form-input">
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="text" id="carPhone-${id}" value="0343222771" class="form-input">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="carDate-${id}" value="${checkInDate}" class="form-input">
      </div>
      <div class="form-group">
        <label>Time</label>
        <input type="time" id="carTime-${id}" value="12:00" class="form-input">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Pick Up Point</label>
        <input type="text" id="carPickup-${id}" placeholder="Enter location" list="pickupLocations-${id}" class="form-input location-input">
        <datalist id="pickupLocations-${id}">
          <option value="Main Lobby">
          <option value="TSN Airport">
        </datalist>
        <div class="quick-select" style="margin-top: 0.5rem;">
          <button type="button" class="quick-btn" onclick="window.app.setLocation('carPickup-${id}', 'Main Lobby')">Main Lobby</button>
          <button type="button" class="quick-btn" onclick="window.app.setLocation('carPickup-${id}', 'TSN Airport')">TSN Airport</button>
        </div>
      </div>
      <div class="form-group">
        <label>Drop Off Point</label>
        <input type="text" id="carDropoff-${id}" placeholder="Enter location" list="dropoffLocations-${id}" class="form-input location-input">
        <datalist id="dropoffLocations-${id}">
          <option value="Main Lobby">
          <option value="TSN Airport">
        </datalist>
        <div class="quick-select" style="margin-top: 0.5rem;">
          <button type="button" class="quick-btn" onclick="window.app.setLocation('carDropoff-${id}', 'Main Lobby')">Main Lobby</button>
          <button type="button" class="quick-btn" onclick="window.app.setLocation('carDropoff-${id}', 'TSN Airport')">TSN Airport</button>
        </div>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Payment</label>
        <select id="carPayment-${id}" class="form-input">
          <option value="Free Comp (If guest enough 2000 points)">Free Comp (2000+ points)</option>
          <option value="Guest Comp">Guest Comp</option>
          <option value="GOA">GOA</option>
        </select>
      </div>
      <div class="form-group">
        <label>Authorizer</label>
        <input type="text" id="carAuthorizer-${id}" value="xujian" class="form-input">
      </div>
    </div>
  `;
  
  container.appendChild(carDiv);
  return id;
}

/**
 * Remove a car form
 */
export function removeCarForm(id) {
  const carDiv = document.getElementById(`car-${id}`);
  if (carDiv) {
    carDiv.remove();
    state.cars.delete(id);
  }
}

/**
 * Set location value
 */
export function setLocation(inputId, location) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = location;
  }
}

/**
 * Generate car service email
 */
export function generateCarEmail() {
  let carDetails = [];
  
  state.cars.forEach((car, id) => {
    const carDiv = document.getElementById(`car-${id}`);
    if (!carDiv) return;
    
    const carType = document.getElementById(`carType-${id}`)?.value;
    const name = document.getElementById(`carName-${id}`)?.value;
    const guests = document.getElementById(`carGuests-${id}`)?.value;
    const phone = document.getElementById(`carPhone-${id}`)?.value;
    const date = document.getElementById(`carDate-${id}`)?.value;
    const time = document.getElementById(`carTime-${id}`)?.value;
    const pickup = document.getElementById(`carPickup-${id}`)?.value;
    const dropoff = document.getElementById(`carDropoff-${id}`)?.value;
    
    if (!name || !date || !time) return;
    
    const formattedDate = formatDateShort(date);
    
    carDetails.push(`${id}, Car Type: ${carType}

Name: ${name}

Number of guests: ${guests}

Phone: ${phone}

Date & time: ${time} ${formattedDate}

Pick up point: ${pickup}

Drop off point: ${dropoff}`);
  });
  
  if (carDetails.length === 0) {
    throw new Error('Please add at least one car booking');
  }
  
  const payment = document.getElementById('carPayment-1')?.value || 'Free Comp (If guest enough 2000 points)';
  const authorizer = document.getElementById('carAuthorizer-1')?.value || 'xujian';
  
  // Generate subject for standalone mode
  const isStandalone = !state.selectedServices.has('room');
  let subject = 'VIP Car Service Request';
  
  if (isStandalone) {
    const agent = document.getElementById('carAgent')?.value?.trim() || '';
    const oldPID = document.getElementById('carOldPID-1')?.value?.trim() || '';
    const newPID = document.getElementById('carNewPID-1')?.value?.trim() || '';
    const pid = resolvePID(oldPID, newPID);
    const name = document.getElementById('carName-1')?.value?.trim() || '';
    const date = formatDateShort(document.getElementById('carDate-1')?.value);
    if (agent && name) {
      subject = `[${agent}] ${pid} ${name} Car Service ${date}`;
    }
  }
  
  return `Subject: ${subject}

Dear @Concierge Services

Please kindly arrange a VIP car as the followings:

${carDetails.join('\n\n')}

Payment: ${payment}
Authorizer: ${authorizer}

Thank you`;
}

// Export to window
window.app.removeCarForm = removeCarForm;
window.app.setLocation = setLocation;
