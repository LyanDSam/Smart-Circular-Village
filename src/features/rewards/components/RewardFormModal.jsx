import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Gift, Save, X, Image as ImageIcon, Tag, Package, Award } from 'lucide-react';

export const RewardFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pointsRequired, setPointsRequired] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('embako');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || initialData.title || '');
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
      setPointsRequired(String(initialData.pointsRequired || ''));
      setStock(String(initialData.stock || ''));
      setCategory(initialData.category || 'embako');
      setIsActive(initialData.isActive !== false);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setPointsRequired('');
      setStock('');
      setCategory('embako');
      setIsActive(true);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      imageUrl,
      pointsRequired: Number(pointsRequired),
      stock: Number(stock),
      category,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {initialData ? 'Edit Reward Item' : 'Tambah Reward Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kelola katalog barang reward bank sampah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 text-xs">
            {/* Reward Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Nama Barang / Reward</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Beras Organik Desa 5kg"
                className="text-xs h-10"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Deskripsi Barang</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Penjelasan singkat mengenai reward item..."
                className="text-xs h-10"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                URL Gambar Reward
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/beras.jpg (Opsional)"
                className="text-xs h-10 font-mono"
              />
            </div>

            {/* Points & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  Poin Dibutuhkan
                </label>
                <Input
                  type="number"
                  min="1"
                  value={pointsRequired}
                  onChange={(e) => setPointsRequired(e.target.value)}
                  placeholder="500"
                  className="text-xs h-10 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  Jumlah Stok
                </label>
                <Input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  className="text-xs h-10 font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden"
                >
                  <option value="embako">Sembako & Pangan</option>
                  <option value="peralatan">Peralatan Rumah Tangga</option>
                  <option value="voucher">Voucher / Token Listrik</option>
                  <option value="pupuk">Pupuk Organik SCV</option>
                  <option value="umum">Umum</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Status Publikasi</label>
                <label className="flex items-center gap-2 h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded-xs text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {isActive ? 'Aktif (Tampil di Katalog)' : 'Non-Aktif'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-10">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold h-10 gap-1.5">
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Reward'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
