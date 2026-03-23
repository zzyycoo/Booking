/**
 * Application state management
 */

export const state = {
  // Service selection
  selectedServices: new Set(),
  
  // Current hotel
  currentHotel: null,
  
  // Guest management
  guestCount: 1,
  guests: new Map(), // guestId -> { id, sharers: [] }
  
  // Car service
  carCount: 1,
  cars: new Map(),
  
  // Golf
  golfGuests: [],
  
  // Bus
  busRoutes: {
    hcmToHt: false,
    htToHcm: false
  },
  
  // A171 mode
  isA171Mode: false,
  a171WithRoom: false,
  a171GuestCount: 0,
  a171SubjectType: 'patron',
  
  // Generated email
  generatedEmail: null
};

/**
 * Initialize state
 */
export function initState() {
  state.selectedServices.clear();
  state.currentHotel = null;
  state.guestCount = 1;
  state.guests.clear();
  state.carCount = 1;
  state.cars.clear();
  state.golfGuests = [];
  state.busRoutes = { hcmToHt: false, htToHcm: false };
  state.isA171Mode = false;
  state.a171WithRoom = false;
  state.a171GuestCount = 0;
  state.a171SubjectType = 'patron';
  state.generatedEmail = null;
}

/**
 * Toggle service selection
 */
export function toggleService(service) {
  if (state.selectedServices.has(service)) {
    state.selectedServices.delete(service);
    return false;
  } else {
    state.selectedServices.add(service);
    return true;
  }
}

/**
 * Check if service is selected
 */
export function isServiceSelected(service) {
  return state.selectedServices.has(service);
}

/**
 * Set current hotel
 */
export function setHotel(hotelCode) {
  state.currentHotel = hotelCode;
}

/**
 * Get current hotel
 */
export function getCurrentHotel() {
  return state.currentHotel;
}

/**
 * Add a new guest
 */
export function addGuest() {
  const id = state.guestCount++;
  state.guests.set(id, { id, sharers: [] });
  return id;
}

/**
 * Remove a guest
 */
export function removeGuest(id) {
  state.guests.delete(id);
}

/**
 * Add sharer to guest
 */
export function addSharer(guestId) {
  const guest = state.guests.get(guestId);
  if (guest) {
    const sharerId = guest.sharers.length + 1;
    guest.sharers.push(sharerId);
    return sharerId;
  }
  return null;
}

/**
 * Set A171 mode
 */
export function setA171Mode(enabled) {
  state.isA171Mode = enabled;
}
