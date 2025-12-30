
export const getCountryFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export const buildFlagUrl = getCountryFlagUrl;

export const regionPrettyName = (name: string) => name;

export const regionFlagCode = (name: string) => 'un'; // default flag
