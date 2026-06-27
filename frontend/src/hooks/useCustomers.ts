import { useState, useEffect, useCallback } from 'react';
import { getCustomers, getCustomer } from '../lib/api';
import { Customer } from '../lib/types';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { customers, loading, error, refresh: fetchCustomers };
}

export function useCustomer(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const data = await getCustomer(customerId);
      setCustomer(data);
    } catch (err) {
      setError('Failed to fetch customer profile');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  return { customer, loading, error, refresh: fetchCustomer };
}
