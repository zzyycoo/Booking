/**
 * Hotel data management
 */
import hotelsData from '../data/hotels.json';

const { hotels } = hotelsData;

/**
 * Get all hotel codes
 */
export function getHotelCodes() {
  return Object.keys(hotels);
}

/**
 * Get hotel by code
 */
export function getHotel(code) {
  return hotels[code] || null;
}

/**
 * Get all hotels
 */
export function getAllHotels() {
  return hotels;
}

/**
 * Get room types for a hotel
 */
export function getRoomTypes(hotelCode) {
  const hotel = hotels[hotelCode];
  return hotel ? hotel.roomTypes : [];
}

/**
 * Get quick select room types for a hotel
 */
export function getQuickRoomTypes(hotelCode) {
  const hotel = hotels[hotelCode];
  return hotel ? hotel.quickTypes : [];
}

/**
 * Get promotion for a specific room type
 */
export function getPromotion(hotelCode, roomType) {
  const hotel = hotels[hotelCode];
  if (!hotel) return null;

  for (const group of hotel.roomTypes) {
    if (group.types.includes(roomType)) {
      return group.promotion;
    }
  }
  return null;
}

/**
 * Get all room types as flat array
 */
export function getAllRoomTypes(hotelCode) {
  const hotel = hotels[hotelCode];
  if (!hotel) return [];

  return hotel.roomTypes.flatMap(group => group.types);
}

/**
 * Get agent quick select list
 */
export function getAgentQuickSelect() {
  return hotelsData.agents.quickSelect;
}

/**
 * Get services configuration
 */
export function getServices() {
  return hotelsData.services;
}
