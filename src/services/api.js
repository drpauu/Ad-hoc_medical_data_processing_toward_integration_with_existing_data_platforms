export const fetchData = async () => {
  try {
    const response = await fetch('../data/database.json'); 
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching the data:', error);
    return null;  
  }
};
