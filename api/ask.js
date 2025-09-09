export default function handler(req, res) {
  res.status(200).json({ answer: 'Hello from serverless!' });
}
