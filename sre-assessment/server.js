const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 8080;
const publicDir = __dirname;

app.use(morgan('tiny'));
app.use(compression());

app.get('/healthz', (req, res) => {
  res.type('text/plain').send('ok');
});

app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  maxAge: '1y',
  index: 'index.html',
  setHeaders: (res, filePath) => {
    if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`SRE Assessment running on http://localhost:${port}`);
});