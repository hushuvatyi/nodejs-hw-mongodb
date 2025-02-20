import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import {
  ACCESS_TOKEN_LIVE_TIME,
  REFRESH_TOKEN_LIVE_TIME,
  SMTP,
  TEMPLATES_DIR,
} from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';
import Handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs';

const resetPasswordEmailTemplate = fs
  .readFileSync(path.join(TEMPLATES_DIR, 'reset-password-email.html'))
  .toString();

const setSessionValues = () => ({
  accessToken: crypto.randomBytes(20).toString('base64'),
  refreshToken: crypto.randomBytes(20).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_LIVE_TIME),
  refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_LIVE_TIME),
});

export const registerUser = async (payload) => {
  let user = await UsersCollection.findOne({ email: payload.email });

  if (user) {
    throw new createHttpError(409, 'User already registered');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  user = await UsersCollection.create({
    ...payload,
    password: hashedPassword,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) throw new createHttpError(404, 'User not found');

  const arePasswordsEqual = await bcrypt.compare(password, user.password);

  if (!arePasswordsEqual)
    throw new createHttpError(401, 'Login or password is incorrect!');

  await SessionsCollection.deleteOne({ userId: user._id });

  const session = SessionsCollection.create({
    ...setSessionValues(),
    userId: user._id,
  });

  return session;
};

export const refreshSession = async ({ sessionId, sessionToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken: sessionToken,
  });

  if (!session) throw createHttpError(401, 'Session not found');
  if (session.refreshTokenValidUntil < Date.now()) {
    throw createHttpError(401, 'Session token expired');
  }

  const user = await UsersCollection.findById(session.userId);
  if (!user) throw createHttpError(401, 'Session user not found');

  await SessionsCollection.findOneAndDelete({ _id: session._id });

  const newSession = SessionsCollection.create({
    ...setSessionValues(),
    userId: session.userId,
  });

  return newSession;
};

export const logoutUser = async ({ sessionId, sessionToken }) => {
  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken: sessionToken,
  });
};

export const requestResetPasswordEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    },
  );

  const resetPasswordLink = `${getEnvVar(
    'FRONTEND_DOMAIN',
  )}/reset-password?token=${resetToken}`;
  console.log(resetPasswordLink);
  const template = Handlebars.compile(resetPasswordEmailTemplate);
  const html = template({
    name: user.name,
    link: resetPasswordLink,
  });

  try {
    await sendEmail({
      from: getEnvVar(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html: html,
    });
  } catch (err) {
    console.error(err);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async ({ password, token }) => {
  let payload;
  try {
    payload = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    console.error(err);
    throw createHttpError(401, 'Token is expired or invalid');
  }
  const user = await UsersCollection.findById(payload.sub);

  if (!user) throw createHttpError(404, 'User not found');

  const hashedPassword = await bcrypt.hash(password, 10);

  await UsersCollection.findByIdAndUpdate(user._id, {
    password: hashedPassword,
  });
};
