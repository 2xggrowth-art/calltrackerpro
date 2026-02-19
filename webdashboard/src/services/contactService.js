import api from './api';

export const contactService = {
  async getContacts(params = {}) {
    try {
      const response = await api.get('/api/contacts', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createContact(contactData) {
    try {
      const response = await api.post('/api/contacts', contactData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getContact(contactId) {
    try {
      const response = await api.get(`/api/contacts/${contactId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateContact(contactId, contactData) {
    try {
      const response = await api.put(`/api/contacts/${contactId}`, contactData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deleteContact(contactId) {
    try {
      const response = await api.delete(`/api/contacts/${contactId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default contactService;