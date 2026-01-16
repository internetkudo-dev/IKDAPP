
export const getCountryFlagUrl = (countryCode: string) => {
    return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export const buildFlagUrl = getCountryFlagUrl;

export const regionPrettyName = (name: string) => name;

export const regionFlagCode = (name: string) => 'un'; // default flag

export const daysToLabel = (days: any, t: any) => {
    if (!days) return "—";
    const d = parseInt(days);
    if (isNaN(d)) return String(days);
    return `${d} ${d === 1 ? t("common.day") : t("common.days")}`;
};
