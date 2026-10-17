import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Package,
  X,
  Save,
} from 'lucide-react';
import { storeApi } from '../../services/api';
import { StoreItem } from '../../types';
import { Button } from '../../components/ui/Button';

interface StaffStorePageProps {
  onNavigate: (path: string) => void;
}

export const StaffStorePage: React.FC<StaffStorePageProps> = () => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Stationery');
  const [price, setPrice] = useState('50');
  const [stock, setStock] = useState('100');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // Staff sees all items (including unpublished)
      const data = await storeApi.getItems({ availableOnly: false });
      setItems(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setCategory('Stationery');
    setPrice('50');
    setStock('100');
    setImageUrl('');
    setIsAvailable(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (item: StoreItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setCategory(item.category || 'Stationery');
    setPrice(String(item.price));
    setStock(String(item.stock));
    setImageUrl(item.imageUrl || '');
    setIsAvailable(item.isAvailable);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        imageUrl: imageUrl.trim() || undefined,
        isAvailable,
      };

      if (editingItem) {
        await storeApi.updateItem(editingItem.id, payload);
        setSuccessMessage(`'${payload.name}' updated successfully!`);
      } else {
        await storeApi.createItem(payload);
        setSuccessMessage(`'${payload.name}' added to store catalog!`);
      }

      setModalOpen(false);
      fetchItems();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: StoreItem) => {
    try {
      const updated = await storeApi.updateItem(item.id, {
        isAvailable: !item.isAvailable,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      setSuccessMessage(
        `Item '${item.name}' is now ${updated.isAvailable ? 'published & visible' : 'hidden from students'}.`
      );
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleDelete = async (item: StoreItem) => {
    if (!confirm(`Are you sure you want to delete '${item.name}' from the catalog?`)) return;

    try {
      await storeApi.deleteItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setSuccessMessage(`'${item.name}' deleted.`);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00D4FF]" /> Store Catalog Management
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Configure campus stationery items, live inventory levels, pricing, and student availability.
          </p>
        </div>

        <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Add Store Item
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#34D399]" />
          <span className="font-bold font-mono">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FB7185]/10 border border-[#FB7185]/20 text-[#FB7185] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#FB7185]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-[#111827] border border-[#273244] rounded-3xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#9CA3AF]/60 text-xs font-mono">
            Loading store inventory...
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-[#9CA3AF] text-xs font-medium">
            No items in store. Click "Add Store Item" to create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D111B]/60 border-b border-[#273244] text-[#9CA3AF] uppercase font-mono font-black text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#273244]/50 font-medium">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1A2232]/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#F9FAFB] text-xs">{item.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] line-clamp-1">{item.description}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-semibold text-[10px] font-mono">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-[#00D4FF] text-sm font-mono">
                      ₹{item.price}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-mono font-bold ${
                          item.stock < 10 ? 'text-[#FB7185]' : 'text-[#F9FAFB]/80'
                        }`}
                      >
                        {item.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors border font-mono ${
                          item.isAvailable
                            ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20 hover:bg-[#34D399]/20'
                            : 'bg-[#1A2232] text-[#9CA3AF] border-[#273244] hover:bg-[#202B3D]'
                        }`}
                        title="Click to toggle visibility"
                      >
                        {item.isAvailable ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.isAvailable ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-[#6B7280] text-[11px] font-mono">
                      {item.createdBy?.slice(0, 10) || 'Desk'}
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-xl bg-[#1A2232] hover:bg-[#202B3D] text-[#9CA3AF] hover:text-[#00D4FF] border border-[#273244] cursor-pointer transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-xl bg-[#FB7185]/10 hover:bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/20 cursor-pointer transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111827] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#273244] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#273244] mb-4">
              <h3 className="font-black text-[#F9FAFB] text-lg">
                {editingItem ? 'Edit Store Item' : 'Add New Stationery Item'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#1A2232] hover:bg-[#202B3D] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#9CA3AF]">Item Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Engineering Graph Book (60 Pgs)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#9CA3AF]">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Lab Apparel">Lab Apparel</option>
                    <option value="Filing & Submission">Filing & Submission</option>
                    <option value="Notebooks & Records">Notebooks & Records</option>
                    <option value="Engineering Graphics">Engineering Graphics</option>
                    <option value="Writing Instruments">Writing Instruments</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#9CA3AF]">Unit Price (₹) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#9CA3AF]">Initial Stock (Units) *</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#9CA3AF]">Availability</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isAvailCheck"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 accent-[#00D4FF] rounded"
                    />
                    <label htmlFor="isAvailCheck" className="text-[#F9FAFB]/80 font-semibold cursor-pointer">
                      Published to Store
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#9CA3AF]">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specification, paper GSM, compliance notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#9CA3AF]">Product Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/item.png"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#273244]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
