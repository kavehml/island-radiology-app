import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Users.css';

const API_URL = '/api';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'radiologist' | 'staff' | 'viewer';
  name: string;
  radiologist_id: number | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface UserFormData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'radiologist' | 'staff' | 'viewer';
  radiologistId: string;
}

const Users: React.FC = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    role: 'staff',
    radiologistId: ''
  });
  const [radiologists, setRadiologists] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (hasRole('admin')) {
      fetchUsers();
      fetchRadiologists();
    }
  }, [hasRole]);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch users');
    }
  };

  const fetchRadiologists = async (): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/radiologists`);
      setRadiologists(response.data);
    } catch (error) {
      console.error('Failed to fetch radiologists:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Update user
        await axios.put(`${API_URL}/users/${editingUser.id}`, {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          radiologistId: formData.radiologistId ? parseInt(formData.radiologistId) : null,
          ...(formData.password && { password: formData.password })
        });
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await axios.post(`${API_URL}/users`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          radiologistId: formData.radiologistId ? parseInt(formData.radiologistId) : null
        });
        setSuccess('User created successfully');
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to save user');
    }
  };

  const handleEdit = (user: User): void => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      radiologistId: user.radiologist_id?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/${userId}`);
      setSuccess('User deactivated successfully');
      fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to deactivate user');
    }
  };

  const resetForm = (): void => {
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'staff',
      radiologistId: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const getRoleBadgeClass = (role: string): string => {
    const classes: Record<string, string> = {
      admin: 'role-badge-admin',
      radiologist: 'role-badge-radiologist',
      staff: 'role-badge-staff',
      viewer: 'role-badge-viewer'
    };
    return classes[role] || 'role-badge-staff';
  };

  if (!hasRole('admin')) {
    return (
      <div className="users-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h2>User Management</h2>
        <button onClick={() => setShowForm(true)} className="add-user-btn">
          Add New User
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="user-form-modal">
          <div className="user-form-content">
            <div className="form-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password {editingUser ? '(leave blank to keep current)' : '*'} </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="radiologist">Radiologist</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Link to Radiologist (Optional)</label>
                <select
                  value={formData.radiologistId}
                  onChange={(e) => setFormData({ ...formData, radiologistId: e.target.value })}
                >
                  <option value="">None</option>
                  {radiologists.map((rad) => (
                    <option key={rad.id} value={rad.id}>
                      {rad.name} ({rad.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Linked Radiologist</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={!user.is_active ? 'inactive-user' : ''}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.radiologist_id
                    ? radiologists.find((r) => r.id === user.radiologist_id)?.name || 'N/A'
                    : 'None'}
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString()
                    : 'Never'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-edit"
                      title="Edit user"
                    >
                      Edit
                    </button>
                    {user.is_active && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="btn-delete"
                        title="Deactivate user"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
