import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Package,
} from 'lucide-react';
import { storeApi, ordersApi } from '../../services/api';
import { StoreItem } from '../../types';
import { Button } from '../../components/ui/Button';

interface StudentStorePageProps {
  onNavigate: (path: string) => void;
}

interface CartEntry {
  item: StoreItem;
  quantity: number;
}

export const StudentStorePage: React.FC<StudentStorePageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    'ALL',
    'Lab Apparel',
    'Filing & Submission',
    'Notebooks & Records',
    'Engineering Graphics',
    'Writing Instruments',
  ];

  const fetchItems = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await storeApi.getItems({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        availableOnly: true,
      });
      setItems(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load store catalog');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const addToCart = (item: StoreItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        if (existing.quantity >= item.stock) {
          alert(`Maximum stock reached for ${item.name} (${item.stock} available).`);
          return prev;
        }
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.item.id === itemId) {
            const nextQty = c.quantity + delta;
            if (nextQty > c.item.stock) {
              alert(`Only ${c.item.stock} available in stock.`);
              return c;
            }
            return { ...c, quantity: nextQty };
          }
          return c;
        })
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== itemId));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    setErrorMessage(null);

    try {
      const payload = {
        orderType: 'STORE' as const,
        items: cart.map((c) => ({
          itemId: c.item.id,
          quantity: c.quantity,
        })),
        paymentMethod,
        pickupCounter: 'Counter #1 (Stationery Desk)',
      };

      const created = await ordersApi.create(payload);
      setCart([]);
      setOrderSuccess(`Order placed! Token: ${created.token}. Ready for counter collection.`);
      setTimeout(() => {
        onNavigate('/student/history');
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place stationery order');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F9FAFB] tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#00D4FF]" /> Campus Stationery Store
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-0.5">
            Official campus stationery, records, drawing sheets, and lab apparel for 1-stop express pickup.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store items..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#273244] bg-[#0D111B] text-[#F9FAFB] placeholder:text-[#9CA3AF]/40 focus:border-[#00D4FF] focus:ring-2 focus:ring-[#00D4FF]/20 outline-hidden font-medium"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Filter
          </Button>
        </form>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#34D399]" />
          <span className="font-bold font-mono">{orderSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FB7185]/10 border border-[#FB7185]/20 text-[#FB7185] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#FB7185]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none font-mono ${
              selectedCategory === cat
                ? 'bg-[#00D4FF] text-black shadow-lg shadow-[#00D4FF]/20 font-black'
                : 'bg-[#0D111B] border border-[#273244] text-[#9CA3AF] hover:bg-[#1A2232] hover:text-[#F9FAFB]'
            }`}
          >
            {cat === 'ALL' ? 'All Essentials' : cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Catalog + Cart Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="py-16 text-center text-[#9CA3AF]/60 font-medium text-xs font-mono">
              Loading campus stationery catalog...
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center bg-[#111827] border border-[#273244] rounded-3xl p-8">
              <Package className="w-12 h-12 text-[#9CA3AF]/30 mx-auto mb-3" />
              <p className="font-bold text-[#F9FAFB] text-sm">No items found</p>
              <p className="text-[#9CA3AF] text-xs mt-1">Try selecting a different category or clearing search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#111827] border border-[#273244] rounded-3xl p-5 shadow-2xl hover:border-[#00D4FF]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-[#9CA3AF]">
                        Stock: {item.stock}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#F9FAFB] text-sm leading-snug">{item.name}</h3>
                    <p className="text-[#9CA3AF] text-xs mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#273244]">
                    <div>
                      <span className="text-[10px] text-[#9CA3AF] block uppercase font-mono font-bold">Price</span>
                      <span className="font-black text-[#00D4FF] text-lg font-mono">₹{item.price}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      disabled={item.stock <= 0}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      {item.stock > 0 ? 'Add to Order' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary / Cart */}
        <div className="lg:col-span-1">
          <div className="bg-[#111827] border border-[#273244] rounded-3xl p-5 shadow-2xl sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#273244]">
              <h3 className="font-black text-[#F9FAFB] text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#00D4FF]" />
                <span>Stationery Tray ({cart.reduce((s, c) => s + c.quantity, 0)})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#FB7185] transition-colors font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-[#9CA3AF]/60 text-xs font-medium">
                Your tray is empty. Add stationery items from the catalog.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cart.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-[#0D111B] border border-[#273244] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-[#F9FAFB] truncate">{item.name}</p>
                        <p className="text-[#9CA3AF] text-[11px] font-mono">₹{item.price} × {quantity}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#00D4FF]/40 cursor-pointer transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold font-mono text-[#F9FAFB] w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-[#1A2232] border border-[#273244] flex items-center justify-center text-[#9CA3AF] hover:text-[#F9FAFB] hover:border-[#00D4FF]/40 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-lg bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/20 hover:bg-[#FB7185]/20 flex items-center justify-center ml-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Selection */}
                <div className="space-y-1.5 pt-2 border-t border-[#273244]">
                  <label className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['UPI', 'CARD', 'CASH'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer font-mono ${
                          paymentMethod === method
                            ? 'bg-[#00D4FF] text-black font-black shadow-md shadow-[#00D4FF]/20'
                            : 'bg-[#0D111B] border border-[#273244] text-[#9CA3AF] hover:bg-[#1A2232]'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal & Placement */}
                <div className="pt-3 border-t border-[#273244] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF] font-medium">Pickup Counter</span>
                    <span className="font-bold text-[#F9FAFB]">Counter #1 (Stationery Desk)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1">
                    <span className="font-bold text-[#9CA3AF]">Total Payable</span>
                    <span className="font-black text-[#00D4FF] text-lg font-mono">₹{cartTotal}</span>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isOrdering || cart.length === 0}
                    className="w-full mt-3"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {isOrdering ? 'Confirming Order...' : 'Place Stationery Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
