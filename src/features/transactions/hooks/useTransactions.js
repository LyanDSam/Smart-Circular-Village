import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '@/services/transactionService';

export const useTransactions = ({ citizenId = null, officerId = null } = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalWasteKg: 0,
    organicWasteKg: 0,
    inorganicWasteKg: 0,
    totalPointsIssued: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [wasteType, setWasteType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await transactionService.getTransactions({
        search,
        wasteType,
        citizenId,
        officerId,
        page,
        pageSize: 10,
      });

      setTransactions(res.transactions);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);

      const txStats = await transactionService.getTransactionStats();
      setStats(txStats);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Gagal memuat riwayat transaksi setoran sampah.');
    } finally {
      setIsLoading(false);
    }
  }, [search, wasteType, citizenId, officerId, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setSearch('');
    setWasteType('all');
    setPage(1);
  };

  return {
    transactions,
    stats,
    isLoading,
    error,
    search,
    setSearch,
    wasteType,
    setWasteType,
    page,
    setPage,
    totalPages,
    totalCount,
    handleResetFilters,
    fetchTransactions,
  };
};
