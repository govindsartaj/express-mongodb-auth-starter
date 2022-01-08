import { Request, Response } from 'express';
import { Db } from 'mongodb';
import * as dbo from '../db/conn';
import propertyExists from '../db/propertyExists';
import { hashPassword, verifyPassword } from '../util/password';
import {
  buildToken,
  insertRefreshTokenInDb,
  verifyRefreshToken,
  verifyToken,
} from '../util/token';

export const verifyJWT = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send({ error: 'missing jwt' });

    const tokenNoBearer = token.split(' ')[1];

    if (!verifyToken(tokenNoBearer))
      return res.status(401).send({ error: 'bad jwt' });

    res.send({ success: 'jwt verified' });
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

export const getRefreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.params.refreshToken;

    const db: Db = dbo.getDb();

    // validate refresh token and check if unused
    const verified = await verifyRefreshToken(refreshToken, db);

    if (!verified) return res.status(401).send({ error: 'bad refresh token' });

    await insertRefreshTokenInDb(refreshToken, (<any>verified).userId, db);
    const newAccessToken = buildToken((<any>verified).userId);
    const newRefreshToken = buildToken((<any>verified).userId, true);

    res.send({
      jwt: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: 'something went wrong' });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const db: Db = dbo.getDb();

    if (await propertyExists(db, 'users', 'username', req.body.username)) {
      return res.status(422).send({ error: 'username taken' });
    }

    if (await propertyExists(db, 'users', 'email', req.body.email)) {
      return res.status(422).send({ error: 'email already in use' });
    }

    const newUser = {
      username: req.body.username,
      password: await hashPassword(req.body.password),
      email: req.body.email,
      verified: false,
      banned: false,
    };

    const inserted = await db.collection('users').insertOne(newUser);
    res.send({ success: `created user ${inserted.insertedId}` });
  } catch (e) {
    res.status(500).send({ error: e.message });
    console.error(e);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const identifier = req.body.identifier;

    const db: Db = dbo.getDb();
    console.log(await hashPassword(req.body.password));

    const user = await db.collection('users').findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user || !verifyPassword(req.body.password, user.password))
      return res.status(401).send({ error: 'check credentials' });

    res.send({
      jwt: buildToken(user._id.toString()),
      refreshToken: buildToken(user._id.toString(), true),
      user,
    });
  } catch (e) {
    res.status(500).send({ error: e.message });
    console.error(e);
  }
};
