import { useState, useEffect } from 'react';
import { getDatabase } from '@/lib/database';
import type { Article, StockBooking, ActivityEntry } from '@/lib/database';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = async () => {
    try {
      setError(null);
      const db = await getDatabase();
      const data = db.getAllArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const createArticle = async (articleData: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => {
    try {
      const db = await getDatabase();
      const newArticle = db.createArticle(articleData);
      await loadArticles(); // Reload to get fresh data
      return newArticle;
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  };

  const updateArticle = async (id: string, articleData: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>) => {
    try {
      const db = await getDatabase();
      const updatedArticle = db.updateArticle(id, articleData);
      await loadArticles(); // Reload to get fresh data
      return updatedArticle;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const db = await getDatabase();
      db.deleteArticle(id);
      await loadArticles(); // Reload to get fresh data
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Defer initialization to prevent blocking React startup
    const timer = setTimeout(() => {
      loadArticles();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    articles,
    loading,
    error,
    createArticle,
    updateArticle,
    deleteArticle,
    refresh: loadArticles
  };
};

export const useStockBookings = () => {
  const [bookings, setBookings] = useState<StockBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const db = await getDatabase();
      const data = db.getAllStockBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<StockBooking, 'id' | 'articleName' | 'timestamp' | 'oldStock' | 'newStock'>) => {
    try {
      const db = await getDatabase();
      const newBooking = db.createStockBooking(bookingData);
      await loadBookings(); // Reload to get fresh data
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return {
    bookings,
    loading,
    createBooking,
    refresh: loadBookings
  };
};

export const useActivities = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const db = await getDatabase();
      const data = db.getAllActivities();
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  return {
    activities,
    loading,
    refresh: loadActivities
  };
};