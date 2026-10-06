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

  const fetchItems = async () => {
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
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

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
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#CCFF00]" /> Campus Stationery Store
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            Official campus stationery, records, drawing sheets, and lab apparel for 1-stop express pickup.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store items..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary">
            Filter
          </Button>
        </form>
      </div>

      {orderSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold font-mono">{orderSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
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
                ? 'bg-[#CCFF00] text-black shadow-lg shadow-[#CCFF00]/20 font-black'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
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
            <div className="py-16 text-center text-white/40 font-medium text-xs font-mono">
              Loading campus stationery catalog...
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center glass-card-dark border border-white/10 rounded-3xl p-8 backdrop-blur-2xl">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="font-bold text-white text-sm">No items found</p>
              <p className="text-white/40 text-xs mt-1">Try selecting a different category or clearing search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl hover:border-white/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/10 text-[#CCFF00] uppercase tracking-wider font-mono">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-white/40">
                        Stock: {item.stock}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm leading-snug">{item.name}</h3>
                    <p className="text-white/50 text-xs mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-white/40 block uppercase font-mono font-bold">Price</span>
                      <span className="font-black text-[#CCFF00] text-lg font-mono">₹{item.price}</span>
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
          <div className="glass-card-dark border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#CCFF00]" />
                <span>Stationery Tray ({cart.reduce((s, c) => s + c.quantity, 0)})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-white/40 hover:text-rose-400 transition-colors font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs font-medium">
                Your tray is empty. Add stationery items from the catalog.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {cart.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="font-bold text-white truncate">{item.name}</p>
                        <p className="text-white/40 text-[11px] font-mono">₹{item.price} × {quantity}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold font-mono text-white w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 flex items-center justify-center ml-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Selection */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold text-white/60 uppercase tracking-wider font-mono">
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
                            ? 'bg-[#CCFF00] text-black font-black shadow-md shadow-[#CCFF00]/20'
                            : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subtotal & Placement */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/50 font-medium">Pickup Counter</span>
                    <span className="font-bold text-white">Counter #1 (Stationery Desk)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1">
                    <span className="font-bold text-white/80">Total Payable</span>
                    <span className="font-black text-[#CCFF00] text-lg font-mono">₹{cartTotal}</span>
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
