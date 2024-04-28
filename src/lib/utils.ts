// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export function convertNumberToReal(value: number) {
  if (!value) {
    return 'R$ 0,00';
  }
  return value.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function roundNumber({
  value,
  decimalPlaces,
}: {
  value: number;
  decimalPlaces: number;
}) {
  const d = Math.pow(10, decimalPlaces);
  return Math.round((value + Number.EPSILON) * d) / d;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isBrazilianPhoneNumber(phoneNumber: string): boolean {
  // Regex to check if the phone number starts with "+55"
  const regex = /^\+55/;

  return regex.test(phoneNumber);
}

export function isValidBrazilianPhoneNumber(phoneNumber: string): boolean {
  // Regex to match exactly "+55" followed by 2 digits for the area code,
  // and then 8 or 9 digits for the phone number, respecting the specified format.
  const regex = /^\+55\d{2}\d{8,9}$/;

  return regex.test(phoneNumber);
}
