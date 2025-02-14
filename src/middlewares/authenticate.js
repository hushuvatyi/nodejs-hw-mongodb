import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  try {
    if (!authHeader) {
      throw createHttpError(401, 'No Authorization header provided');
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer') {
      throw createHttpError(401, 'Authorization shoud be of Bearer type');
    }

    if (!token) {
      throw createHttpError(401, 'No Access token provided');
    }

    const session = await SessionsCollection.findOne({ accessToken: token });

    if (!session) {
      throw new createHttpError(401, 'No active session found');
    }

    if (session.accessTokenValidUntil < Date.now()) {
      throw createHttpError(401, 'Access token expired');
    }

    const user = await UsersCollection.findById(session.userId);

    if (!user) {
      SessionsCollection.findByIdAndDelete(session._id);
      throw createHttpError(401, 'No user found for this session');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
