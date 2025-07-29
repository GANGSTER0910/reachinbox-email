import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {ImapService} from './services/imapservice';
// import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const emailUser = process.env.EMAIL_USER!;
const emailPass = process.env.EMAIL_PASS!;
app.use(cors());
app.use(express.json());
const imapService = new ImapService(emailUser, emailPass);
imapService.connectrealtime();
app.get('/', (_req, res) => {
  res.send('Email Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
