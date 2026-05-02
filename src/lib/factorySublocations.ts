export interface Sublocation {
  code: string;
  name: string;
}

export interface FactorySublocations {
  [factoryCode: string]: Sublocation[];
}

export const factorySublocations: FactorySublocations = {
  'Olenguruone': [
    { code: 'OLG', name: 'Olenguruone' },
    { code: 'KTG', name: 'Kiptagich' },
    { code: 'AML', name: 'Amalo' },
    { code: 'TNT', name: 'Tinet' },
    { code: 'CMR', name: 'Chemaner' },
    { code: 'KPK', name: 'Kapkures' },
    { code: 'TCH', name: 'Tachasis' },
  ],
  'Kapkoros': [
    { code: 'KPK', name: 'Kapkoros' },
    { code: 'KPM', name: 'Kaptumo' },
    { code: 'NDN', name: 'Ndanai' },
  ],
};

export const getSublocationsForFactory = (factoryCode: string): Sublocation[] => {
  return factorySublocations[factoryCode] || [];
};

export const getSublocationByCode = (factoryCode: string, code: string): Sublocation | undefined => {
  const sublocations = factorySublocations[factoryCode];
  return sublocations?.find(s => s.code === code);
};