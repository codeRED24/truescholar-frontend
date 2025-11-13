
import { City } from "../@types/city-type";

export const getCitySitemapData = async (): Promise<City[]> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const BEARER_TOKEN = process.env.NEXT_PUBLIC_BEARER_TOKEN;

    if (!API_URL || !BEARER_TOKEN) {
        throw new Error(
            "API URL or Bearer token is missing from environment variables."
        );
    }

    const response = await fetch(`${API_URL}/cities`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
        },
        next: { revalidate: 10800 }
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    try {
        const data: City[] = await response.json();
        return data;
    } catch {
        throw new Error("Failed to parse response as JSON.");
    }
};
