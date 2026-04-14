import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import HttpStatus from 'http-status';

import UserSchema from '@models/user-model';

import { tokenInfo } from '@config/index';
import admin from '@utils/firebase';

export default {
  async userSignup(req: Request, res: Response, next: NextFunction) {
    const { name, email, password } = req.body;

    try {
      // ✅ Check if user already exists
      const existingUser = await UserSchema.findOne({ email });
      if (existingUser) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'EMAIL_ALREADY_REGISTERED',
          code: 'EMAIL_ALREADY_REGISTERED'
        });
      }

      // ✅ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Create user
      const user = await UserSchema.create({
        fullName: name,
        email,
        password: hashedPassword,
      });

      // ✅ Generate token (JWT)
      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          firebaseUID: user.firebaseUID ?? null,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(HttpStatus.CREATED).json({
        message: 'SIGNUP_SUCCESSFUL',
        code: 'SIGNUP_SUCCESSFUL',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'INTERNAL_ERROR' });
    }
  },
  async userSignupWithGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Token missing' });

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;

      const userAlreadyExists = await UserSchema.findOne({ email });
      if (userAlreadyExists) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'USER_ALREADY_EXISTS' });

      const newUser = await UserSchema.create({
        firebaseUID: uid,
        fullName: name,
        email,
        photoURL: picture,
      });

      const token = jwt.sign(
        {
          id: newUser._id,
          fullName: newUser.fullName,
          email: email,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(HttpStatus.CREATED).json({
        message: 'SIGNUP_SUCCESSFUL',
        token,
        user: {
          id: newUser._id,
          firebaseUID: uid,
          fullName: newUser.fullName,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
    }
  },
  async userSignin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      // ✅ Check if user exists
      const user = await UserSchema.findOne({ email });

      if ((!user || !user.password)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'INVALID_CREDENTIALS',
          code: 'INVALID_CREDENTIALS'
        });
      }

      const currentUser = user;

      // ✅ Compare password
      const isMatch = await bcrypt.compare(password, currentUser.password);
      if (!isMatch) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'INVALID_CREDENTIALS' });

      // ✅ Generate Token
      const token = jwt.sign(
        {
          id: currentUser._id,
          fullName: currentUser.fullName,
          email: currentUser.email,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(HttpStatus.OK).json({
        message: 'SIGNIN_SUCCESSFUL',
        code: 'SIGNIN_SUCCESSFUL',
        token,
        user: {
          id: user._id,
          fullName: user?.fullName || '',
          email: user?.email || '',
          photoURL: user?.photoURL || '',
          createdAt: user?.createdAt || '',
        },
      });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'INTERNAL_ERROR' });
    }
  },

  async userSigninWithGoogle(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Token missing' });

      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // ✅ Check if user exists in MongoDB
      const user = await UserSchema.findOne({ email: decodedToken.email });

      // If not in DB, create new user record
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'USER_NOT_FOUND' });
      }

      const token = jwt.sign(
        {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
        tokenInfo.jwtSecret,
        { expiresIn: '7d' },
      );

      res.status(HttpStatus.OK).json({
        message: 'SIGNIN_SUCCESSFUL',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          photoURL: user.photoURL,
        },
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(HttpStatus.UNAUTHORIZED).json({ error: 'INVALID_TOKEN' });
    }
  },
};
