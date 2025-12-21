import { authedFetch } from "@/utils/authService";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const addHolding = async (data: any) => {
  const path = `/holdings`;

  const res = await authedFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to add holding");
  }

  return res.json();
};

export const getHoldings = async () => {
  try {
    console.log("getting holdings");
    const query = `/holdings?includePrices=true`;

    const res = await authedFetch(query, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch holdings");
    }

    return res.json();
  } catch (error) {
    console.error("Error in getHoldings:", error);
    throw error;
  }
};

export const deleteHolding = async (holdingId: string) => {
  const path = `/holdings/${holdingId}`;

  const res = await authedFetch(path, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete holding");
  }

  return res.json();
};

export async function getInstitutions() {
  const path = `/api/plaid/institutions`;
  const res = await authedFetch(path, {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to fetch institutions");
  return await res.json();
}
