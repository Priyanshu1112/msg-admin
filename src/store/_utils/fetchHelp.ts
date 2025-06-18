/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/_utils/fetchHelp.ts

export async function fetchPOST<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchPUT<T = any>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function fetchDELETE<T = any>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
  });
  return res.json();
}
