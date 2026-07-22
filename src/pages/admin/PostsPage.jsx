import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { postService } from '@/services/postService';
import { PostFormModal } from '@/features/posts/components/PostFormModal';
import { ReassignOfficerModal } from '@/features/posts/components/ReassignOfficerModal';
import {
  Building2,
  Cpu,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowRightLeft,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await postService.getPosts({ search, page, pageSize: 9 });
      setPosts(res.posts);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Error fetching posts:', err);
      showToast('Gagal memuat daftar Posko Pengumpulan.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreateNew = () => {
    setPostToEdit(null);
    setFormModalOpen(true);
  };

  const handleEdit = (post) => {
    setPostToEdit(post);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(deletePostId);
      showToast('Posko Pengumpulan berhasil dihapus.');
      setDeletePostId(null);
      await fetchPosts();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus posko.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics summary
  const totalAssignedDevices = posts.reduce((acc, p) => acc + (p.deviceIds?.length || 0), 0);
  const totalAssignedOfficers = posts.reduce((acc, p) => acc + (p.officerIds?.length || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Manajemen Posko Pengumpulan"
        description="Kelola posko stasiun pengumpulan, penugasan perangkat IoT, dan penugasan petugas posko."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReassignModalOpen(true)}
              className="gap-2 text-xs font-semibold border-slate-200 dark:border-slate-800"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Tugaskan Petugas</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleCreateNew}
              className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Posko</span>
            </Button>
          </div>
        }
      />

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between animate-in fade-in ${
            feedback.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold opacity-75">
            Tutup
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Posko Aktif"
          value={totalCount}
          subtitle="Posko Pengumpulan Sampah SCV"
          icon={Building2}
          color="emerald"
        />
        <MetricCard
          title="Perangkat Terpasang"
          value={totalAssignedDevices}
          subtitle="IoT Collection & Compost Nodes"
          icon={Cpu}
          color="blue"
        />
        <MetricCard
          title="Petugas Bertugas"
          value={totalAssignedOfficers}
          subtitle="Petugas Lapangan Posko"
          icon={Users}
          color="amber"
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama posko, desa, alamat..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Post Cards Grid */}
      {isLoading ? (
        <LoadingState message="Memuat daftar posko..." />
      ) : posts.length === 0 ? (
        <EmptyState
          title="Belum Ada Posko Pengumpulan"
          description={
            search
              ? 'Tidak ditemukan posko yang sesuai dengan pencarian.'
              : 'Klik tombol "Tambah Posko" untuk mendaftarkan posko pengumpulan pertama.'
          }
          action={
            <Button onClick={handleCreateNew} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              <span>Tambah Posko Baru</span>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.postId}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                      {post.village || 'Desa Circular Utama'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {post.name}
                    </h3>
                  </div>
                  <Badge variant={post.isActive ? 'success' : 'secondary'} className="text-[10px]">
                    {post.isActive ? 'Aktif' : 'Non-Aktif'}
                  </Badge>
                </div>

                {/* Address */}
                {post.address && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 line-clamp-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{post.address}</span>
                  </p>
                )}

                {post.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic">
                    "{post.description}"
                  </p>
                )}

                {/* Badges Summary */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block uppercase">
                      Perangkat IoT
                    </span>
                    <span className="text-sm font-extrabold text-blue-900 dark:text-blue-200">
                      {post.deviceIds?.length || 0} Unit
                    </span>
                  </div>

                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block uppercase">
                      Petugas
                    </span>
                    <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                      {post.officerIds?.length || 0} Orang
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] text-slate-400">
                  ID: {post.postId}
                </span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    className="h-8 px-2 text-slate-600 hover:text-emerald-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletePostId(post.postId)}
                    className="h-8 px-2 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-slate-500">
            Menampilkan halaman {page} dari {totalPages} ({totalCount} Posko)
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs gap-1"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <PostFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSaved={fetchPosts}
        postToEdit={postToEdit}
      />

      {/* Reassign Officer Modal */}
      <ReassignOfficerModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        onReassigned={fetchPosts}
        posts={posts}
      />

      {/* Delete Confirmation Modal */}
      {deletePostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <Trash2 className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Hapus Posko Pengumpulan?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Posko akan dinonaktifkan. Perangkat IoT dan petugas yang terdaftar di posko ini akan secara otomatis dibebaskan dari penugasan posko.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletePostId(null)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="text-xs font-bold"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus Posko'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
