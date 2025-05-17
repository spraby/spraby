export const serializeObject = (obj: any) => {
  const json = JSON.stringify(obj, (_key, value) =>
    typeof value === 'bigint'
      ? value.toString()
      : value
  );
  return JSON.parse(json);
};

export const toMoney = (value: number, template: string = '{{amount}} BYN') => {
  const formattedValue = (Math.round(value * 100) / 100).toFixed(2);
  return template.replaceAll('{{amount}}', formattedValue);
}
