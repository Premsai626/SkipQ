import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';

interface StudentProfilePageProps {
  onNavigate: (path: string, replace?: boolean) => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({ onNavigate }) => {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [institution, setInstitution] = useState(user?.institution || 'Campus Institute of Technology');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '3rd Year');
  const [phone, setPhone] = useState(user?.phone || '');
  const [collegeId, setCollegeId] = useState(user?.collegeId || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    if (user) {
      setName(user.name || '');
      setInstitution(user.institution || 'Campus Institute of Technology');
      setDepartment(user.department || '');
      setYearOfStudy(user.yearOfStudy || '3rd Year');
      setPhone(user.phone || '');
      setCollegeId(user.collegeId || '');
      setProfilePhoto(user.profilePhoto || '');
    }
  }

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
        yearOfStudy: yearOfStudy.trim(),
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
      setErrorMessage(err.message || 'Failed to update profile');
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
        <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight flex items-center gap-2">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#06D6F0]" /> Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Manage your verified campus credentials, contact information, and academic department details.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#F87171]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#34D399]" />
          <span className="font-bold font-mono">Profile updated successfully! Your campus credentials are up to date.</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-[#121821] border border-[#273244] rounded-2xl p-4 sm:p-6 lg:p-7 space-y-6"
      >
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-[#273244]">
          <div className="relative">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt={name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#06D6F0]/40"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#18212C] text-[#06D6F0] flex items-center justify-center font-bold text-xl border border-[#273244] font-mono">
                {name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-[#18212C] rounded-full border border-[#273244] text-[#94A3B8]">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-[#F1F5F9] truncate">{name || 'Campus Student'}</h2>
              <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[10px] font-bold uppercase tracking-wider font-mono">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-[#F1F5F9]">{collegeId || 'Roll No. Not Set'}</span>
              <span className="text-[#273244]">•</span>
              <span>{department || 'General Academic'}</span>
            </p>
            <p className="text-[11px] text-[#94A3B8]/60 mt-0.5 font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-[#06D6F0]" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium"
            />
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#6B7280]" /> Campus Email (Read-Only)
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#0B0F14] text-[#94A3B8]/50 font-mono font-medium cursor-not-allowed"
            />
          </div>

          {/* Institution */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#06D6F0]" /> Institution / College
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Campus Institute of Technology"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium"
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#06D6F0]" /> Department / Branch
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium"
            />
          </div>

          {/* Roll No / College ID */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              Roll Number / Student ID
            </label>
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="e.g. 21BCS1084"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium font-mono"
            />
          </div>

          {/* Year of Study */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#6B7280]" /> Year of Study
            </label>
            <select
              value={yearOfStudy}
              onChange={(e) => setYearOfStudy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#06D6F0]" /> Phone Number (SMS Alerts)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium font-mono"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-1.5">
            <label className="font-bold text-[#94A3B8] flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#6B7280]" /> Profile Photo URL (Optional)
            </label>
            <input
              type="url"
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#273244] bg-[#18212C] text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-5 border-t border-[#273244] gap-3">
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
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};
