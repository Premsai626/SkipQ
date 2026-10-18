import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

import {
  X,
  GraduationCap,
  Store,
  Lock,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export type UserRole = 'student' | 'staff';
export type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
  defaultMode?: AuthMode;
  onStudentSuccess?: (data: { rollNo: string; email?: string }) => void;
  onStaffSuccess?: (data: { shopId: string; name?: string }) => void;
}

// Google 4-Color SVG Icon
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'student',
  defaultMode = 'signin',
  onStudentSuccess,
  onStaffSuccess,
}) => {
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  // Student Form State (Clean - Zero hardcoded demo defaults)
  const [studentRollNo, setStudentRollNo] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentDept, setStudentDept] = useState('CSE (AIML)');
  const [studentPassword, setStudentPassword] = useState('');

  // Staff Form State
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffDept, setStaffDept] = useState('Campus Stationery');

  // Auth Context
  const { login, register, signInWithGoogle } = useAuth();

  // Loading & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synchronize role and mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setRole(defaultRole);
      setMode(defaultMode);
      setSuccessMessage(null);
    }
  }, [isOpen, defaultRole, defaultMode]);

  // Handle standard form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);

    try {
      if (role === 'student') {
        const studentIdentifier = studentEmail.trim() || (studentRollNo ? `${studentRollNo.toLowerCase().trim()}@campus.edu` : '');
        if (!studentIdentifier) {
          throw new Error('Please enter your email or roll number');
        }
        if (!studentPassword) {
          throw new Error('Password is required');
        }

        if (mode === 'signin') {
          await login(studentIdentifier, studentPassword);
          setSuccessMessage(`Authenticated successfully. Connecting to your Student Dashboard...`);
        } else {
          if (!studentName.trim()) throw new Error('Please enter your full name');
          if (studentPassword.length < 6) throw new Error('Password must be at least 6 characters');

          await register({
            name: studentName.trim(),
            email: studentIdentifier,
            password: studentPassword,
            role: 'student',
            department: studentDept,
            collegeId: studentRollNo.trim(),
          });
          setSuccessMessage(`Account created for ${studentName}! Redirecting to Dashboard...`);
        }

        setTimeout(() => {
          setIsLoading(false);
          if (onStudentSuccess) onStudentSuccess({ rollNo: studentRollNo, email: studentEmail });
          onClose();
        }, 800);
      } else {
        // Staff Authentication
        const email = staffIdentifier.includes('@')
          ? staffIdentifier.toLowerCase().trim()
          : `${staffIdentifier.toLowerCase().trim()}@campus.edu`;

        if (!email || !staffPassword) {
          throw new Error('Please enter both your staff email/terminal ID and password');
        }

        if (mode === 'signin') {
          await login(email, staffPassword);
          setSuccessMessage(`Stationery staff authenticated. Launching Operator Dashboard...`);
        } else {
          if (!staffName.trim()) throw new Error('Please enter your full name');
          if (staffPassword.length < 6) throw new Error('Password must be at least 6 characters');

          await register({
            name: staffName.trim(),
            email,
            password: staffPassword,
            role: 'staff',
            department: staffDept || 'Campus Stationery',
            collegeId: staffIdentifier.trim(),
          });
          setSuccessMessage(`Staff account created for ${staffName}! Launching Operator Dashboard...`);
        }

        setTimeout(() => {
          setIsLoading(false);
          if (onStaffSuccess) onStaffSuccess({ shopId: staffIdentifier, name: staffName || staffIdentifier });
          onClose();
        }, 800);
      }
    } catch (err: any) {
      setIsLoading(false);
      alert(err?.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // Handle Google SSO
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setSuccessMessage(`Connecting to Google OAuth...`);

    try {
      localStorage.setItem('xeroxflow_post_auth_redirect', role === 'staff' ? '/staff' : '/student');
      localStorage.setItem('xeroxflow_google_selected_role', role);
      await signInWithGoogle();
    } catch (err: any) {
      setIsGoogleLoading(false);
      setSuccessMessage(null);
      alert(err?.message || 'Google authentication failed. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Frosted Glass Dark Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Minimal Obsidian Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-[#121821] text-[#F1F5F9] rounded-2xl p-4 sm:p-6 shadow-2xl border border-[#273244] my-auto overflow-hidden"
          >
            {/* Modal Header */}
            <div className="relative flex items-center justify-between pb-3.5 border-b border-[#273244] mb-4">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-[#06D6F0] text-black flex items-center justify-center font-bold shrink-0">
                  {role === 'student' ? <GraduationCap className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-[#F1F5F9] truncate">
                    {role === 'staff'
                      ? mode === 'signin'
                        ? 'Operator Sign In'
                        : 'Create Staff Account'
                      : mode === 'signin'
                      ? 'Sign In to SkipQ'
                      : 'Create Student Account'}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] font-normal truncate">
                    {role === 'student' ? 'Student Campus Access Gateway' : 'Stationery & Xerox Operator Terminal'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#18212C] hover:bg-[#202B3D] text-[#94A3B8] hover:text-[#F1F5F9] flex items-center justify-center transition-colors border border-[#273244] shrink-0"
                aria-label="Close modal"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Selector 1: Role Switcher (Student vs Stationery Staff) */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#18212C] rounded-xl border border-[#273244] mb-3">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  setSuccessMessage(null);
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  role === 'student'
                    ? 'bg-[#06D6F0] text-black shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('staff');
                  setSuccessMessage(null);
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  role === 'staff'
                    ? 'bg-[#06D6F0] text-black shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Stationery Staff</span>
              </button>
            </div>

            {/* Top Selector 2: Mode Switcher (Sign In vs Sign Up) */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex rounded-xl bg-[#18212C] p-1 border border-[#273244] text-xs font-semibold w-full">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    mode === 'signin'
                      ? 'bg-[#121821] text-[#06D6F0] font-bold shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  Existing Member (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                    mode === 'signup'
                      ? 'bg-[#121821] text-[#06D6F0] font-bold shadow-xs'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  New Member (Sign Up)
                </button>
              </div>
            </div>

            {/* Google Authentication SSO Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#18212C] text-[#F1F5F9] hover:bg-[#202B3D] border border-[#273244] font-semibold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-[#06D6F0] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#273244]"></div>
              <span className="text-[10px] uppercase font-bold text-[#94A3B8]/60 tracking-wider">
                Or continue with {role === 'student' ? 'Credentials' : 'Terminal Account'}
              </span>
              <div className="h-px flex-1 bg-[#273244]"></div>
            </div>

            {/* Feedback Message */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/40 text-[#34D399] text-xs font-bold flex items-center gap-2.5 backdrop-blur-md"
              >
                <CheckCircle2 className="w-4 h-4 text-[#34D399] flex-shrink-0" />
                <span className="leading-snug">{successMessage}</span>
              </motion.div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* STUDENT SIGN IN */}
              {role === 'student' && mode === 'signin' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Student Email or Roll Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value)}
                        placeholder="e.g. 21R11A6642 or student@campus.edu"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                      <GraduationCap className="w-4 h-4 text-[#94A3B8]/60 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                      <Lock className="w-4 h-4 text-[#94A3B8]/60 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* STUDENT SIGN UP */}
              {role === 'student' && mode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Full name"
                        className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value.toUpperCase())}
                        placeholder="College Roll No."
                        className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Department / Branch
                      </label>
                      <select
                        value={studentDept}
                        onChange={(e) => setStudentDept(e.target.value)}
                        className="w-full px-3 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                      >
                        <option value="CSE (AIML)">CSE (AIML)</option>
                        <option value="CSE (General)">CSE (General)</option>
                        <option value="CSE (Data Science)">CSE (Data Science)</option>
                        <option value="Information Tech (IT)">Information Tech (IT)</option>
                        <option value="ECE">ECE</option>
                        <option value="Mechanical Eng">Mechanical Eng</option>
                        <option value="Civil Eng">Civil Eng</option>
                        <option value="Aerospace Eng">Aerospace Eng</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        College Email
                      </label>
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="yourname@campus.edu"
                        className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Set Password
                    </label>
                    <input
                      type="password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                      required
                    />
                  </div>
                </>
              )}

              {/* STAFF SIGN IN */}
              {role === 'staff' && mode === 'signin' && (
                <>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Staff Email or Terminal Identifier
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={staffIdentifier}
                        onChange={(e) => setStaffIdentifier(e.target.value)}
                        placeholder="e.g. staff.desk@campus.edu or MLRIT-XEROX-01"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 font-mono"
                        required
                      />
                      <Store className="w-4 h-4 text-[#94A3B8]/60 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Operator Security Password / PIN
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="Enter password or PIN"
                        className="w-full pl-3.5 pr-9 py-2.5 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                      <KeyRound className="w-4 h-4 text-[#94A3B8]/60 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}

              {/* STAFF SIGN UP */}
              {role === 'staff' && mode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Staff Full Name
                      </label>
                      <input
                        type="text"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="Operator Name"
                        className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                        Station / Department
                      </label>
                      <input
                        type="text"
                        value={staffDept}
                        onChange={(e) => setStaffDept(e.target.value)}
                        placeholder="Campus Stationery"
                        className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Staff Email
                    </label>
                    <input
                      type="email"
                      value={staffIdentifier}
                      onChange={(e) => setStaffIdentifier(e.target.value)}
                      placeholder="operator@campus.edu"
                      className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Set Password / PIN
                    </label>
                    <input
                      type="password"
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2 bg-[#18212C] border border-[#273244] rounded-xl text-xs font-medium text-[#F1F5F9] placeholder:text-[#94A3B8]/40 focus:outline-none focus:border-[#06D6F0] focus:ring-1 focus:ring-[#06D6F0]/30"
                      required
                    />
                  </div>
                </>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full mt-2 h-11 rounded-xl bg-[#06D6F0] text-black font-bold text-xs uppercase tracking-wide hover:bg-[#06D6F0]/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Authentication...</span>
                  </div>
                ) : (
                  <>
                    <span>
                      {role === 'staff'
                        ? mode === 'signin'
                          ? 'Launch Operator Terminal'
                          : 'Create Staff Account'
                        : mode === 'signin'
                        ? 'Access Student Dashboard'
                        : 'Create Student Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Institutional Assurance */}
            <div className="mt-4 pt-3 border-t border-[#273244] flex items-center justify-between text-[10px] text-[#94A3B8]">
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#06D6F0]" />
                <span>MLRIT Institutional Security • 2026</span>
              </div>
              <span className="font-semibold text-[#F1F5F9]">
                {role === 'student' ? 'Student Hub' : 'Stationery Hub'}
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
