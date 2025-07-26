import app from './app';

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Backend is running guyz!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
