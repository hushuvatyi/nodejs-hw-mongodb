import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from '../services/auth.js';

const setCookies = (session, res) => {
  res.cookie('sessionToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
};

export const registerUserController = async (req, res) => {
  const { body } = req;

  const user = await registerUser(body);

  res.status(201).json({
    status: 201,
    massage: 'Successfuly registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const { body } = req;

  const session = await loginUser(body);
  setCookies(session, res);
  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const refreshSessionController = async (req, res) => {
  const session = await refreshSession({
    sessionId: req.cookies.sessionId,
    sessionToken: req.cookies.sessionToken,
  });

  setCookies(session, res);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

export const logoutUserController = async (req, res) => {
  await logoutUser({
    sessionId: req.cookies.sessionId,
    sessionToken: req.cookies.sessionToken,
  });

  res.clearCookie('sessionToken');
  res.clearCookie('sessionId');

  res.sendStatus(204);
};
