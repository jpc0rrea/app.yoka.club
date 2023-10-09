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
