/**
 * Centralized Booking Financials & Old/New Flow Classification Engine
 *
 * Old booking system (before Nov 9, 2026, 13:00:00 UTC / 6:30 PM IST):
 *   - total_amount already includes extension amounts.
 *   - totalDue = Number(booking.total_amount) || 0.
 *
 * New booking system (on or after Nov 9, 2026, 13:00:00 UTC):
 *   - total_amount stores original rental amount.
 *   - extended_amount stores extensions separately.
 *   - totalDue = total_amount + extended_amount.
 */

const NEW_FLOW_CUTOFF = new Date("2026-11-09T13:00:00.000Z");

/**
 * Authoritative classification rule based solely on booking creation timestamp.
 * Never classify based on supports_partial_payments, is_extended, or payment_status.
 */
const isNewFlowBooking = (booking) => {
  if (!booking || !booking.createdAt) return false;
  return new Date(booking.createdAt) >= NEW_FLOW_CUTOFF;
};

/**
 * Unified calculation of totalDue, paidAmount, and pendingAmount
 */
const getBookingFinancials = (booking) => {
  if (!booking) {
    return { totalDue: 0, paidAmount: 0, pendingAmount: 0, isNew: false };
  }

  const isNew = isNewFlowBooking(booking);
  const totalDue = isNew
    ? (Number(booking.total_amount) || 0) + (Number(booking.extended_amount) || 0)
    : (Number(booking.total_amount) || 0);

  let paidAmount = 0;
  let pendingAmount = 0;

  if (!isNew) {
    // Old bookings: If marked paid, entire totalDue is paid; no false pending badges
    paidAmount = booking.payment_status === "paid" ? totalDue : (Number(booking.paid_amount) || 0);
    pendingAmount = booking.payment_status === "paid" ? 0 : Math.max(0, totalDue - (Number(booking.paid_amount) || 0));
  } else {
    // New bookings: Read paid_amount; if paid_amount is 0 but marked paid, safely handle
    paidAmount = Number(booking.paid_amount) || 0;
    if (paidAmount === 0 && booking.payment_status === "paid" && totalDue > 0) {
      paidAmount = totalDue;
    }
    pendingAmount = Math.max(0, totalDue - paidAmount);
  }

  return { totalDue, paidAmount, pendingAmount, isNew };
};

module.exports = {
  NEW_FLOW_CUTOFF,
  isNewFlowBooking,
  getBookingFinancials,
};

