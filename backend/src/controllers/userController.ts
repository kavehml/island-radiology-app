import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, radiologistId } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const userRole = (role || 'staff') as 'admin' | 'radiologist' | 'staff' | 'viewer';
    const user = await User.create(email, password, userRole, name, radiologistId || null);

    res.status(201).json(user);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { email, name, role, radiologistId, password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update password if provided
    if (password) {
      await User.updatePassword(userId, password);
    }

    // Update role if provided
    if (role) {
      await User.updateRole(userId, role as 'admin' | 'radiologist' | 'staff' | 'viewer');
    }

    // Update email if provided
    if (email && email !== user.email) {
      await User.updateEmail(userId, email);
    }

    // Update name if provided
    if (name) {
      await User.updateName(userId, name);
    }

    // Update radiologist ID if provided
    if (radiologistId !== undefined) {
      await User.updateRadiologistId(userId, radiologistId ? parseInt(radiologistId) : null);
    }

    const updatedUser = await User.findById(userId);
    if (!updatedUser) {
      res.status(404).json({ error: 'User not found after update' });
      return;
    }

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      radiologist_id: updatedUser.radiologist_id,
      is_active: updatedUser.is_active,
      last_login: updatedUser.last_login
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await User.deactivate(userId);
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
