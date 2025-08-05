export const calculatePricePerCheckin = (checkInsQuantity: number) => {
  if (checkInsQuantity < 4) return 30;
  if (checkInsQuantity < 8) return 28;
  if (checkInsQuantity < 12) return 26;
  return 22;
};

export const MIN_CHECK_IN_AMOUNT = 5;
export const MAX_CHECK_IN_AMOUNT = 20;
export const MINUTES_TO_CANCEL_CHECK_IN = 10;
export const MINUTES_TO_CHECK_IN = -10;
export const TOLERANCE_MINUTES_TO_ENTER_EVENT = 30;
export const LIMIT_TIME_TO_WATCH_SESSION_IN_HOURS = 6;
export const DEFAULT_HEADER_TITLE = `yoka club`;
