import api from './api';

export const createProduct = async (payload: Record<string, any>) => {
  const response = await api.post('/products', payload);
  return response.data.data;
};

export const uploadProductImages = async (productId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  formData.append('productId', productId);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

export const getProducts = async (filters: Record<string, any> = {}) => {
  const response = await api.get('/products', { params: filters });
  return response.data.data;
};

export const getProductById = async (productId: string) => {
  const response = await api.get(`/products/${productId}`);
  return response.data.data;
};

export const deleteProductImage = async (imageId: string) => {
  const response = await api.delete(`/upload/${imageId}`);
  return response.data;
};
