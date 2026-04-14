export const calculateExpiryDate = (
  expiryTime: string,
  customValue?: string,
  customUnit?: string
): Date | undefined => {
  if (!expiryTime || expiryTime === 'never') {
    return undefined;
  }

  const expiresAt = new Date();
  let value: number;
  let unit: string;

  if (expiryTime === 'custom') {
    value = parseInt(customValue || '0');
    unit = customUnit || 'm';
  } else {
    // Parse something like "10m", "1h", "1d"
    value = parseInt(expiryTime.slice(0, -1));
    unit = expiryTime.slice(-1);
  }

  if (isNaN(value)) {
    return undefined;
  }

  switch (unit) {
    case 'm':
      expiresAt.setMinutes(expiresAt.getMinutes() + value);
      break;
    case 'h':
      expiresAt.setHours(expiresAt.getHours() + value);
      break;
    case 'd':
      expiresAt.setDate(expiresAt.getDate() + value);
      break;
    default:
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Default 10m
  }

  return expiresAt;
};
