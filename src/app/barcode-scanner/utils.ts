const BASE_URL = 'https://optixtoolkit-backend-production-abcd.up.railway.app';

export const getInventoryByBarcodeID = async (barcodeId: string) => {
  const response = await fetch(`${BASE_URL}/inventory/${barcodeId}`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  return response.json();
};

export const postTool = async ({ barcodeId, name, category, reserverID }: { barcodeId: string; name: string; category: string; reserverID: string }) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint: 'post-tool', barcodeId, name, category, reserverID }),
  });
  if (!response.ok) throw new Error('Failed to reserve tool');
  return response.json();
};

export const postInventoryDecreaseCountByName = async (name: string) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint: 'post-inventory-decrease-count-by-name', name }),
  });
  if (!response.ok) throw new Error('Failed to decrease inventory count');
  return response.json();
};

export const getToolsByReserverID = async (reserverID: string) => {
  const response = await fetch(`${BASE_URL}/tools/${reserverID}`);
  if (!response.ok) throw new Error('Failed to fetch tools');
  return response.json();
};

export const postInventoryIncreaseCountByName = async ({ name }: { name: string }) => {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint: 'post-inventory-increase-count-by-name', name }),
  });
  if (!response.ok) throw new Error('Failed to increase inventory count');
  return response.json();
};

export const deleteToolsByReserverID = async (reserverID: string, name: string) => {
  const response = await fetch(`${BASE_URL}/tools/${reserverID}/${name}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete tool');
  return response.json();
};
