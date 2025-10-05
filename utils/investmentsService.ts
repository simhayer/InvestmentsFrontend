export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const addHolding = async (data: any) => {
  const res = await fetch(`${API_URL}/holdings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to add holding");
  }

  return res.json();
};

export const getHoldings = async () => {
  console.log("getting holdings");
  const currency = "USD"; //Todo: make dynamic
  const url = new URL(`${API_URL}/holdings`);
  url.searchParams.set("includePrices", "true");
  url.searchParams.set("currency", currency);

  const res = await fetch(url.toString(), {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch holdings");
  }

  return res.json();
};

export const deleteHolding = async (holdingId: string) => {
  const res = await fetch(`${API_URL}/holdings/${holdingId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete holding");
  }

  return res.json();
};

export async function getInstitutions() {
  const res = await fetch(`${API_URL}/api/plaid/institutions`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch institutions");
  return await res.json();
}
