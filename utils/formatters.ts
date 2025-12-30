
export function formatPackageName(name: any) {
    return name;
}

export function formatDateTime(date: any) {
    return new Date(date).toLocaleString();
}

export function formatCurrencyEUR(amount: any) {
    return `€${Number(amount).toFixed(2)}`;
}
