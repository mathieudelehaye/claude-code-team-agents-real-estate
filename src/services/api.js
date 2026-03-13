const API_BASE_URL = 'http://localhost:3000/api';

export async function getAllFlats() {
  const response = await fetch(`${API_BASE_URL}/flats`);
  if (!response.ok) throw new Error('Failed to fetch flats');
  return response.json();
}

export async function getFlatById(id) {
  const response = await fetch(`${API_BASE_URL}/flats/${id}`);
  if (!response.ok) throw new Error('Failed to fetch flat');
  return response.json();
}
