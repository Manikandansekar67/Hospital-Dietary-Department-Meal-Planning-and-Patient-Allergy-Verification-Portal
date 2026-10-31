import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit2,
  Key,
  Phone,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/NavigationControls';
import { Select } from '../../components/common/Select';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { adminService } from '../../services/adminService';
import { Role, User } from '../../types';

export const computeDobPassword = (dobStr: string): string => {
  if (!dobStr) return '';
  const ymd = dobStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${d.padStart(2, '0')}${m.padStart(2, '0')}${y}`;
  }
  const digits = dobStr.replace(/\D/g, '');
  if (digits.length === 8) return digits;
  return dobStr;
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [userRole, setUserRole] = useState<Role>('doctor');
  const [department, setDepartment] = useState('');

  // Validation & error states
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setAge('');
    setDateOfBirth('');
    setPassword('');
    setUserRole('doctor');
    setDepartment('');
    setFormError(null);
    setFormFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone || '');
    setAge(u.age !== undefined && u.age !== null ? String(u.age) : '');
    setDateOfBirth(u.dateOfBirth || '');
    setPassword('');
    setUserRole(u.role);
    setDepartment(u.department || '');
    setFormError(null);
    setFormFieldErrors({});
    setIsModalOpen(true);
  };

  const handleDobChange = (val: string) => {
    setDateOfBirth(val);
    setFormFieldErrors((prev) => ({ ...prev, dateOfBirth: '' }));
    if (val) {
      const birthDate = new Date(val);
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 130) {
          setAge(calculatedAge.toString());
          setFormFieldErrors((prev) => ({ ...prev, age: '' }));
        }
      }
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await adminService.toggleUserStatus(id, currentActive);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err: any) {
      console.error('Failed to toggle user status:', err?.response?.data?.error?.message || err?.message);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteUser(u.id);
      setUsers((prev) => prev.filter((user) => user.id !== u.id));
      setSuccessMsg(`User "${u.name}" was successfully deleted.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.message || 'Failed to delete user');
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    const cleanPhone = phone.replace(/[\s\-().]/g, '');
    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?\d{7,15}$/.test(cleanPhone)) {
      errors.phone = 'Enter a valid phone number (7 to 15 digits).';
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dobDate = new Date(dateOfBirth);
      if (isNaN(dobDate.getTime()) || dobDate > new Date()) {
        errors.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    const ageNum = parseInt(age, 10);
    if (!age.trim() || isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
      errors.age = 'Age must be a valid number between 0 and 130.';
    }

    setFormFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const ageNumber = age.trim() ? parseInt(age.trim(), 10) : undefined;
      const initialDobPassword = dateOfBirth ? computeDobPassword(dateOfBirth) : undefined;

      if (editingUser) {
        const updated = await adminService.updateUser(editingUser.id, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          age: ageNumber,
          dateOfBirth,
          role: userRole,
          department: department.trim(),
        });
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
      } else {
        const created = await adminService.addUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          age: ageNumber,
          dateOfBirth,
          // If custom password provided use it, otherwise DOB in DDMMYYYY format
          password: password.trim() || initialDobPassword || 'Hospital@123',
          role: userRole,
          department: department.trim(),
          active: true,
        });
        setUsers((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Failed to save user. Please verify your input.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search)) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-5">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hospital Portal User Accounts</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage access privileges for hospital physicians, dietary kitchen staff, and administrative audit roles.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add New User
        </Button>
      </div>

      {/* Filter and search toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, phone, or department..."
          className="w-full sm:w-80"
        />
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'admin', 'doctor', 'kitchen', 'patient'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors uppercase whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / Cards */}
      {isLoading ? (
        <LoadingState message="Loading directory records..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No portal users found"
          description="No users matched your current query or role filter."
          action={{ label: 'Add First User', onClick: handleOpenAdd }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">User Name &amp; Email</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold">Contact &amp; DOB</th>
                  <th className="py-3 px-4 font-bold">Department / Ward</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-semibold">{u.name}</strong>
                          <span className="text-slate-500 text-[11px]">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'teal'
                            : u.role === 'doctor'
                            ? 'info'
                            : u.role === 'kitchen'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.phone || '—'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {u.dateOfBirth ? u.dateOfBirth : '—'}
                            {u.age !== undefined && u.age !== null ? ` (${u.age} yrs)` : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{u.department || 'General Dietary'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          u.active ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100"
                          title="Edit user details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u.id, u.active)}
                          className={`p-1.5 rounded ${
                            u.active
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.active ? 'Disable user access' : 'Enable user access'}
                        >
                          {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Permanently delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Credentials' : 'Add New Hospital User'}
        subtitle="Manage access roles, credentials, and departmental assignment"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Full Name & Clinical Credentials *"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFormFieldErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="e.g. Dr. Sarah Jenkins, MD"
            required
            error={formFieldErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormFieldErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="e.g. sjenkins@hospital.org"
              required
              error={formFieldErrors.email}
            />

            <Input
              label="Phone Number *"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFormFieldErrors((prev) => ({ ...prev, phone: '' }));
              }}
              placeholder="e.g. +1 555-0199 or 9876543210"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              error={formFieldErrors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date of Birth *"
              type="date"
              value={dateOfBirth}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleDobChange(e.target.value)}
              required
              leftIcon={<Calendar className="w-4 h-4" />}
              error={formFieldErrors.dateOfBirth}
            />

            <Input
              label="Age *"
              type="number"
              min={0}
              max={130}
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setFormFieldErrors((prev) => ({ ...prev, age: '' }));
              }}
              placeholder="e.g. 34"
              required
              error={formFieldErrors.age}
            />
          </div>

          <Select
            label="System Role"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as Role)}
            options={[
              { value: 'admin', label: 'Admin (Dietary Administration)' },
              { value: 'doctor', label: 'Doctor (Physician / Clinical Nutritionist)' },
              { value: 'kitchen', label: 'Kitchen Staff (Preparation Specialist)' },
              { value: 'patient', label: 'Patient (Inpatient Bedside)' },
            ]}
          />

          <Input
            label="Hospital Department / Ward"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Endocrinology & Nutrition / Ward 3"
          />

          {!editingUser && (
            <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-teal-900">
                <Key className="w-4 h-4 text-teal-700" />
                <span>Initial Account Password (DDMMYYYY format)</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                {dateOfBirth ? (
                  <>
                    The initial sign-in password for this account will be automatically set to Date of Birth in DDMMYYYY format:{' '}
                    <strong className="font-mono bg-teal-200/60 text-teal-950 px-1.5 py-0.5 rounded border border-teal-300">
                      {computeDobPassword(dateOfBirth)}
                    </strong>
                    . The user can log in with their registered Email or Phone Number.
                  </>
                ) : (
                  'Please select a Date of Birth above. The Date of Birth formatted as DDMMYYYY will automatically serve as the user\'s initial login password.'
                )}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingUser ? 'Save Updates' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
