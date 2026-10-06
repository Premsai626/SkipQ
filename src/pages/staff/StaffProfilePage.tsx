import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface StaffProfilePageProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const StaffProfilePage: React.FC<StaffProfilePageProps> = ({ onNavigate }) => {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || 'Campus Stationery & Xerox Center');
  const [department, setDepartment] = useState(user?.department || 'Counter #2 • Main Desk');
  const [phone, setPhone] = useState(user?.phone || '');
  const [collegeId, setCollegeId] = useState(user?.collegeId || 'STAFF-DESK-01');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setInstitution(user.institution || 'Campus Stationery & Xerox Center');
      setDepartment(user.department || 'Counter #2 • Main Desk');
      setPhone(user.phone || '');
      setCollegeId(user.collegeId || 'STAFF-DESK-01');
      setProfilePhoto(user.profilePhoto || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        institution: institution.trim(),
        department: department.trim(),
        phone: phone.trim(),
        collegeId: collegeId.trim(),
        profilePhoto: profilePhoto.trim(),
      });

      if (updated) {
        setUser(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update operator profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/', true);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#CCFF00]" /> Staff Operator Profile
        </h1>
        <p className="text-sm text-white/50 mt-0.5">
          Manage your operator terminal credentials, contact information, and station assignment.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold font-mono">Operator profile saved successfully!</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="glass-card-dark border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-2xl"
      >
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-white/10">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#CCFF00]/40 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-white/10 to-white/5 text-white flex items-center justify-center font-black text-2xl border border-white/15 shadow-xl">
                <ShieldCheck className="w-9 h-9 text-[#CCFF00]" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-[#121215] rounded-full shadow border border-white/15 text-white/70">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white truncate">{name || 'Xerox Desk Operator'}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 text-[10px] font-black uppercase tracking-wider font-mono">
                Staff Operator
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1 flex items-center gap-2">
              <span className="font-mono font-bold text-white/80">{collegeId || 'STAFF-DESK-01'}</span>
              <span className="text-white/20">•</span>
              <span>{department || 'Counter #2 • Main Desk'}</span>
            </p>
            <p className="text-[11px] text-white/40 mt-0.5 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Operator Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-[#CCFF00]" /> Operator Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium"
            />
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-white/40" /> Staff Email (Read-Only)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 font-mono font-medium cursor-not-allowed"
            />
          </div>

          {/* Institution / Campus Section */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#00F0FF]" /> Facility / Institution
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Campus Stationery & Xerox Center"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium"
            />
          </div>

          {/* Desk / Counter Assignment */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              Counter Assignment / Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Counter #2 • Main Desk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium"
            />
          </div>

          {/* Terminal Code */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              Terminal Identifier
            </label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="e.g. STAFF-DESK-01"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium font-mono"
            />
          </div>

          {/* Operator Contact Phone */}
          <div className="space-y-1.5">
            <label className="font-bold text-white/70 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#CCFF00]" /> Contact Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium font-mono"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-bold text-white/70 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-white/40" /> Operator Profile Photo URL (Optional)
            </label>
            <input
              type="url"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>

          <Button
            type="submit"
            size="md"
            disabled={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isSaving ? 'Saving...' : 'Save Operator Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
