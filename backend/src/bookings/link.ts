import { GoneException } from '@nestjs/common';

// A visitor's booking link stops working this long after the trip ends
// (the team still sees the booking in the admin panel)
export const LINK_DAYS_AFTER_TRIP = 90;

export const linkExpired = (endDate: Date) =>
  Date.now() > endDate.getTime() + LINK_DAYS_AFTER_TRIP * 86_400_000;

export function checkLinkIsValid(endDate: Date) {
  if (linkExpired(endDate)) {
    throw new GoneException(
      'This booking link has expired. Please contact us if you need anything about this trip.',
    );
  }
}
