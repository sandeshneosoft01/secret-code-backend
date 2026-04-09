import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserSchema from '@models/user-model';

import { tokenInfo } from '@config/index';
import admin from '@utils/firebase';

export default {
  async userSignup(req: Request, res: Response, next: NextFunction) {
    const { name, email, password, role } = req.body;

    try {
      // ✅ Check if user already exists
      const existingUser = await UserSchema.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create user
      const user = await UserSchema.create({
        fullName: name,
        email,
        password: hashedPassword,
        role: role || 'user',
      });

      // ✅ Generate token (JWT)
      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          firebaseUID: user.firebaseUID ?? null, // null for simple signup
          role: user.role,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(201).json({
        message: 'Signup successful',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
      next(error);
    }
  },
  async userSignupWithGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, role } = req.body;
      if (!idToken) return res.status(400).json({ error: 'Token missing' });

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      const userAlreadyExists = await UserSchema.findOne({ email });
      if (userAlreadyExists) return res.status(400).json({ error: 'User already exists' });

      const newUser = await UserSchema.create({
        firebaseUID: uid,
        fullName: name,
        email,
        photoURL: picture,
        role: role || 'user',
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          fullName: newUser.fullName,
          email: email,
          role: newUser.role,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(201).json({
        message: 'Signup success',
        token,
        user: {
          id: newUser._id,
          firebaseUID: uid,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: error.message });
    }
  },
  async userSignin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      // ✅ Check if user exists
      const user = await UserSchema.findOne({ email });

      if ((!user || !user.password)) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      if (user.status === 'suspended') {
        return res.status(400).json({
          success: false,
          message: 'Your account is suspended. Please contact the administrator for assistance.',
        });
      }

      const currentUser = user;

      // ✅ Compare password
      const isMatch = await bcrypt.compare(password, currentUser.password);
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

      // ✅ Generate Token
      const token = jwt.sign(
        {
          id: currentUser._id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          role: currentUser.role,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(200).json({
        message: 'Signin successful',
        token,
        user: {
          id: currentUser._id,
          fullName: currentUser.fullName,
          email: currentUser.email,
          role: currentUser.role,
          status: currentUser.status,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async userSigninWithGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(400).json({ error: 'Token missing' });

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // ✅ Check if user exists in MongoDB
      const user = await UserSchema.findOne({ email: decodedToken.email });

      // If not in DB, create new user record
      if (!user) {
        res.status(401).json({ error: 'User not found' });
      }

      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(200).json({
        message: 'Signin success',
        token,
        user,
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  },
};
