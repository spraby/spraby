export const serializeObject = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

export const toMoney = (value: number, template: string = '{{amount}} BYN') => {
  const formattedValue = (Math.round(value * 100) / 100).toFixed(2);
  return template.replaceAll('{{amount}}', formattedValue);
}
