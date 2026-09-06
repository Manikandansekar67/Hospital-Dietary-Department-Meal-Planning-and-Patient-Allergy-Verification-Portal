import React, { useEffect, useState } from 'react';
import { CheckCircle2, Edit2, Plus, Search, Shield, UserCheck, UserX } from 'lucide-react';
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

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userRole, setUserRole] = useState<Role>('doctor');
  const [department, setDepartment] = useState('');

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
    setUserRole('doctor');
    setDepartment('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setUserRole(u.role);
    setDepartment(u.department || '');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    const updated = await adminService.toggleUserStatus(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updated = await adminService.updateUser(editingUser.id, {
        name,
        email,
        role: userRole,
        department,
      });
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
    } else {
      const created = await adminService.addUser({
        name,
        email,
        role: userRole,
        department,
        active: true,
      });
      setUsers((prev) => [created, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
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
          placeholder="Search by name, email, or department..."
          className="w-full sm:w-72"
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
                          onClick={() => handleToggleActive(u.id)}
                          className={`p-1.5 rounded ${
                            u.active
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.active ? 'Disable user access' : 'Enable user access'}
                        >
                          {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
        subtitle="Manage access roles and departmental assignment"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name & Clinical Credentials"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Sarah Jenkins, MD"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. sjenkins@hospital.org"
            required
          />
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

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingUser ? 'Save Updates' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
