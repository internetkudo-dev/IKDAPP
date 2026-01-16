import { useState, useCallback, useEffect } from "react";
import { OrderResponse } from "@/store/odersApi.slice";

export type ActiveEsimData = {
    id: string;
    flag: string;
    title: string;
    used: number;
    usedBytes: number;
    total: number;
    totalBytes: number;
    usedUnit: "MB" | "GB";
    totalUnit: "MB" | "GB";
    daysLeft: number;
    isActive: boolean;
    order: OrderResponse;
};

export function useEsimData() {
    const [activeEsims, setActiveEsims] = useState<ActiveEsimData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/my-esims');
            // const data = await response.json();

            // Mock data for now
            setActiveEsims([]);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        activeEsims,
        isLoading,
        error,
        refetch: fetchData,
    };
}
