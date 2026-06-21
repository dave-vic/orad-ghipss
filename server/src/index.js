import 'dotenv/config';

// JSON doesn't support BigInt — convert to string automatically
BigInt.prototype.toJSON = function () { return this.toString(); };

import app from './app.js';
import { env } from './config/env.js';

const port = parseInt(env.PORT, 10);

app.listen(port, () => {
  console.log(`ORAD server running on port ${port}`);
});
