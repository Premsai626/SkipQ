import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  CreditCard,
  Sliders,
  LogOut,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface StudentProfilePageProps {
  onNavigate: (path: string) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [defaultDuplex, setDefaultDuplex] = useState(true);
  const [defaultColor, setDefaultColor] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogout = () => {
    logout();
    onNavigate('/');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your verified campus credentials, print defaults, and alert channels.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-card space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
            {user?.name?.slice(0, 2).toUpperCase() || 'PS'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Prem Sai'}</h2>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: <span className="font-mono font-bold text-slate-800">{user?.collegeId || '21BCS1084'}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.department || 'Computer Science & Engineering'}
            </p>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Email</span>
              <span className="font-semibold text-slate-800">{user?.email || 'prem.sai@campus.edu'}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Phone className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone (SMS Alerts)</span>
              <span className="font-semibold text-slate-800">{user?.phone || '+91 98765 43210'}</span>
            </div>
          </div>
        </div>

        {/* Print Presets */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Default Printing Preferences
          </h3>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer text-xs">
              <div>
                <span className="font-bold text-slate-800">Auto Double-Sided (Duplex)</span>
                <p className="text-slate-400 text-[11px]">Saves paper & cost automatically for all submissions</p>
              </div>
              <input
                type="checkbox"
                checked={defaultDuplex}
                onChange={(e) => setDefaultDuplex(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 cursor-pointer text-xs">
              <div>
                <span className="font-bold text-slate-800">SMS Notification on Pickup Ready</span>
                <p className="text-slate-400 text-[11px]">Receive an immediate text when token reaches counter</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
              </span>
            )}
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
