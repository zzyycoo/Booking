/**
 * Main application entry
 * Hotel Service Booking System v3.0
 */
import './css/variables.css';
import './css/layout.css';
import './css/forms.css';
import './css/components.css';

import { initState, toggleService, isServiceSelected, state } from './js/state.js';
import { getServices, getAgentQuickSelect } from './js/hotels.js';
import { formatDate, formatDateShort, getTodayStr, getTomorrowStr, resolvePID } from './js/utils.js';
import { 
  initRoomBooking, 
  setAgent, 
  selectHotel, 
  addGuestForm, 
  removeGuestForm,
  addSharerForm,
  removeSharerForm,
  setRoomType,
  setRoomTypeFromSelect,
  searchPID,
  generateRoomEmail,
  validateRoomForm
} from './js/room-booking.js';
import { 
  initCarService, 
  addCarForm, 
  removeCarForm, 
  setLocation,
  generateCarEmail 
} from './js/car-booking.js';
import { 
  initGolfBooking, 
  addGolfGuestForm,
  removeGolfGuestForm,
  updateGolfPax,
  syncGolfGuests,
  generateGolfEmail 
} from './js/golf-booking.js';
import { 
  initBusService, 
  toggleBusRoute,
  generateBusEmail 
} from './js/bus-booking.js';

// App version
const VERSION = '3.0.0';

/**
 * Initialize application
 */
function init() {
  initState();
  renderHeader();
  renderServiceSelector();
  bindEvents();
  
  // Initialize global PID database (will be loaded from file)
  window.pidDatabase = new Map();
  window.oldPIDIndex = new Map();
  window.newPIDIndex = new Map();
  window.pidDatabaseLoaded = false;
  
  console.log(`Booking App v${VERSION} initialized`);
}

/**
 * Render header
 */
function renderHeader() {
  const header = document.querySelector('.app-header');
  if (header) {
    header.innerHTML = `
      <h1>🏨 Hotel Service Booking System</h1>
      <div class="version">v${VERSION} | Modular Vite Architecture</div>
    `;
  }
}

/**
 * Render service selector
 */
function renderServiceSelector() {
  const container = document.getElementById('service-selector');
  if (!container) return;

  const services = getServices();
  const serviceList = Object.entries(services).filter(([_, config]) => config.enabled);

  container.innerHTML = serviceList.map(([key, config]) => `
    <div class="service-card" data-service="${key}" onclick="window.app.selectService('${key}')">
      <span class="icon">${config.icon}</span>
      <span class="title">${config.title}</span>
    </div>
  `).join('');
}

/**
 * Select a service
 */
function selectService(service) {
  const card = document.querySelector(`[data-service="${service}"]`);
  const isSelected = toggleService(service);
  
  if (isSelected) {
    card.classList.add('selected');
    showSection(service);
    initSection(service);
  } else {
    card.classList.remove('selected');
    hideSection(service);
  }
}

/**
 * Show service section
 */
function showSection(service) {
  const section = document.getElementById(`${service}-section`);
  if (section) {
    section.style.display = 'block';
    section.classList.add('fade-in');
    
    // Scroll to section
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}

/**
 * Hide service section
 */
function hideSection(service) {
  const section = document.getElementById(`${service}-section`);
  if (section) {
    section.style.display = 'none';
    section.classList.remove('fade-in');
  }
}

/**
 * Initialize service section
 */
function initSection(service) {
  switch (service) {
    case 'room':
      initRoomBooking();
      break;
    case 'car':
      initCarService();
      break;
    case 'golf':
      initGolfBooking();
      break;
    case 'bus':
      initBusService();
      break;
  }
}

/**
 * Bind global events
 */
function bindEvents() {
  // Generate button
  const generateBtn = document.getElementById('btn-generate');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateAllEmails);
  }

  // Copy button
  const copyBtn = document.getElementById('btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyToClipboard);
  }

  // Send button
  const sendBtn = document.getElementById('btn-send');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendEmail);
  }
}

/**
 * Generate all emails based on selected services
 */
function generateAllEmails() {
  const preview = document.getElementById('email-preview');
  const errors = [];
  
  // Validate required fields
  if (state.selectedServices.has('room')) {
    const roomErrors = validateRoomForm();
    if (roomErrors.length > 0) {
      errors.push(...roomErrors);
    }
  }
  
  if (errors.length > 0) {
    showToast(errors[0], 'error');
    return;
  }
  
  let emails = [];
  let subject = '';
  
  try {
    if (isServiceSelected('room')) {
      const roomEmail = generateRoomEmail();
      emails.push(roomEmail);
      
      // Extract subject for combined emails
      const subjectMatch = roomEmail.match(/Subject:\s*(.+?)\n/);
      subject = subjectMatch ? subjectMatch[1].trim() : 'Booking Request';
    }
    
    if (isServiceSelected('car')) {
      const carEmail = generateCarEmail();
      emails.push(carEmail);
      
      if (!subject) {
        const subjectMatch = carEmail.match(/Subject:\s*(.+?)\n/);
        subject = subjectMatch ? subjectMatch[1].trim() : 'Car Service Request';
      }
    }
    
    if (isServiceSelected('golf')) {
      const golfEmail = generateGolfEmail();
      emails.push(golfEmail);
      
      if (!subject) {
        const subjectMatch = golfEmail.match(/Subject:\s*(.+?)\n/);
        subject = subjectMatch ? subjectMatch[1].trim() : 'Golf Booking Request';
      }
    }
    
    if (isServiceSelected('bus')) {
      const busEmail = generateBusEmail();
      emails.push(busEmail);
      
      if (!subject) {
        const subjectMatch = busEmail.match(/Subject:\s*(.+?)\n/);
        subject = subjectMatch ? subjectMatch[1].trim() : 'Bus Service Request';
      }
    }
    
    if (emails.length === 0) {
      preview.textContent = 'Please select at least one service.';
      return;
    }
    
    // Generate combined output
    let combinedEmail = '';
    
    if (emails.length === 1) {
      combinedEmail = emails[0];
    } else {
      // Multiple services - combine with separators
      const bodies = emails.map(email => {
        return email.replace(/^Subject:\s*.+?\n+/m, '').trim();
      });
      
      combinedEmail = `Subject: ${subject}\n\n${bodies.join('\n\n---\n\n')}`;
    }
    
    // Store for copy/send
    window.generatedEmail = combinedEmail;
    
    // Display with HTML formatting
    preview.innerHTML = combinedEmail
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\r?\n/g, '<br>\n');
    
    showToast('✓ Email generated!', 'success');
    
    // Scroll to preview
    document.getElementById('email-preview-section')?.scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    showToast(error.message || 'Error generating email', 'error');
    console.error(error);
  }
}

/**
 * Copy to clipboard
 */
async function copyToClipboard() {
  if (!window.generatedEmail) {
    showToast('Please generate email first', 'warning');
    return;
  }
  
  const plainText = window.generatedEmail;
  
  // Try modern clipboard API first
  if (navigator.clipboard && navigator.clipboard.write) {
    try {
      const htmlText = `<!DOCTYPE html><html><body><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">${plainText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p></body></html>`;
      
      const item = new ClipboardItem({
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
        'text/html': new Blob([htmlText], { type: 'text/html' })
      });
      
      await navigator.clipboard.write([item]);
      showToast('✓ Copied! Paste directly into Outlook/Gmail', 'success');
      return;
    } catch (err) {
      // Fall through to fallback
    }
  }
  
  // Fallback to text-only
  try {
    await navigator.clipboard.writeText(plainText);
    showToast('✓ Email copied to clipboard!', 'success');
  } catch (err) {
    // Final fallback - execCommand
    const textarea = document.createElement('textarea');
    textarea.value = plainText;
    textarea.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('✓ Email copied to clipboard!', 'success');
    } catch (e) {
      showToast('Copy failed. Please copy manually.', 'error');
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Send email (mailto)
 */
function sendEmail() {
  if (!window.generatedEmail) {
    showToast('Please generate email first', 'warning');
    return;
  }
  
  const subjectMatch = window.generatedEmail.match(/Subject:\s*(.+?)\n/);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'Booking Request';
  const body = encodeURIComponent(window.generatedEmail.replace(/^Subject:\s*.+?\n+/m, '').trim());
  
  // Build recipients
  let recipients = 'concierge@thegrandhotram.com,Front.Desk@thegrandhotram.com';
  
  window.location.href = `mailto:${recipients}?subject=${encodeURIComponent(subject)}&body=${body}`;
  
  showToast('Opening email client...', 'info');
}

/**
 * Show toast message
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Handle PID file import (Excel)
 */
function handlePIDImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  showToast('📖 Reading PID database...', 'info');
  
  // Check if XLSX library is available
  if (typeof XLSX === 'undefined') {
    showToast('XLSX library not loaded. Please include sheetjs.', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Clear existing database
      window.pidDatabase.clear();
      window.oldPIDIndex.clear();
      window.newPIDIndex.clear();
      
      let count = 0;
      
      // Process data
      jsonData.forEach(row => {
        const oldPID = String(row['Old PID'] || '').trim();
        const newPID = String(row['New PID'] || '').trim();
        const name = String(row['Player Name'] || '').trim();
        
        if (name && (oldPID || newPID)) {
          const uniqueID = newPID || oldPID;
          
          window.pidDatabase.set(uniqueID, {
            oldPID: oldPID || null,
            newPID: newPID || null,
            name: name
          });
          
          if (oldPID) window.oldPIDIndex.set(oldPID, uniqueID);
          if (newPID) window.newPIDIndex.set(newPID, uniqueID);
          
          count++;
        }
      });
      
      window.pidDatabaseLoaded = true;
      showToast(`✓ ${count.toLocaleString()} PID records loaded`, 'success');
      
    } catch (error) {
      console.error('Error reading PID file:', error);
      showToast('❌ Error reading Excel file', 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

// Export to window for inline onclick handlers and global access
window.app = {
  // Service selection
  selectService,
  
  // Room booking
  setAgent,
  selectHotel,
  addGuestForm,
  removeGuestForm,
  addSharerForm,
  removeSharerForm,
  setRoomType,
  setRoomTypeFromSelect,
  searchPID,
  
  // Car service
  addCarForm,
  removeCarForm,
  setLocation,
  
  // Golf booking
  addGolfGuestForm,
  removeGolfGuestForm,
  updateGolfPax,
  syncGolfGuests,
  
  // Bus service
  toggleBusRoute,
  
  // Global actions
  generateAllEmails,
  copyToClipboard,
  sendEmail,
  showToast,
  handlePIDImport,
  
  // Utilities
  formatDate,
  formatDateShort,
  getTodayStr,
  getTomorrowStr,
  resolvePID
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
