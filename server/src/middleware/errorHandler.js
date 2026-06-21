import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      fields: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (env.NODE_ENV === 'production') {
    return res.status(status).json({ error: status < 500 ? message : 'Internal server error' });
  }

  res.status(status).json({ error: message, stack: err.stack });
};
