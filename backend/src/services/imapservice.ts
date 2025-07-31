import { inspect } from 'util';
import dotenv from 'dotenv';
import Imap from 'node-imap';
import { indexEmail } from '../utils/indexemail';
import { simpleParser } from 'mailparser';
import { htmlToText } from 'html-to-text';
import he from 'he';
dotenv.config();

export class ImapService {
  private imap: Imap;

  constructor(
    private user: string,
    private password: string,
    private host: string = 'imap.gmail.com',
    private port: number = 993,
    private tls: boolean = true
  ) {
    this.imap = new Imap({
      user: this.user,
      password: this.password,
      host: this.host,
      port: this.port,
      tls: this.tls,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  private openInbox(cb: (err: Error | null, box: Imap.Box) => void) {
    this.imap.openBox('INBOX', false, cb);
  }

  public connectrealtime(): void {
    this.imap.once('ready', () => {
      console.log(`✅ IMAP connection ready for ${this.user}`);
      this.openInbox((err, box) => {
        if (err) return console.error(`❌ Error opening inbox for ${this.user}:`, err);
        console.log(`📬 Inbox opened for ${this.user}.`);
        this.fetchInitialEmails();
      });
    });

    this.imap.on('mail', (numNewMsgs: number) => {
        console.log(`📬 New mail event: ${numNewMsgs} new message(s) arrived!`);
        this.fetchNewEmails(numNewMsgs);
    });

    this.imap.on('error', (err: Error) => console.error(`❌ IMAP connection error for ${this.user}:`, err.message));
    this.imap.on('close', (hadError: boolean) => {
        console.log(`🔌 IMAP connection closed for ${this.user}. Reconnecting in 10 seconds...`);
        setTimeout(() => this.imap.connect(), 10000);
    });
    
    this.imap.connect();
  }

  public triggerManualFetch(): void {
    console.log(`🔄 Triggering manual email fetch for ${this.user}...`);
    this.fetchInitialEmails();
  }

  private fetchInitialEmails(): void {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 90);
    const searchCriteria = [['SINCE', sinceDate.toISOString()]];
    const fetchOptions = { bodies: '', struct: true };

    this.imap.search(searchCriteria, (err, results) => {
      if (err || !results || results.length === 0) {
        if (err) console.error(`❌ Initial search error for ${this.user}:`, err);
        console.log(`📭 No new emails found for initial sync.`);
        return;
      }

      const f = this.imap.fetch(results, fetchOptions);
      f.on('message', (msg, seqno) => this.handleMessage(msg, this.user, 'inbox'));
      f.once('error', (err) => console.error('❌ Error fetching initial emails:', err));
      f.once('end', () => {
        console.log(`✅ Finished fetching all initial emails for ${this.user}.`);
      });
    });
  }
  
  private fetchNewEmails(numNewMsgs: number): void {
     this.openInbox((err, box) => {
        if (err) return console.error('❌ Error opening inbox for new mail fetch:', err);
        if(numNewMsgs > 0){
            const f = this.imap.fetch(`${box.messages.total - numNewMsgs + 1}:*`, { bodies: '', struct: true });
            f.on('message', (msg, seqno) => this.handleMessage(msg, this.user, 'inbox'));
            f.once('error', (err) => console.error('❌ Error fetching new emails:', err));
            f.once('end', () => {
                console.log('✅ Finished fetching new emails.');
            });
        }
    });
  }

  private handleMessage(msg: Imap.ImapMessage, account: string, folder: string): void {
    let buffer = '';
    msg.on('body', (stream) => {
      stream.on('data', (chunk) => buffer += chunk.toString('utf8'));
      stream.once('end', async () => {
        try {
          const parsed = await simpleParser(buffer);
          await indexEmail({
            subject: parsed.subject || '',
            from: parsed.from?.text || '',
            to: Array.isArray(parsed.to)
              ? parsed.to.map(addrObj => (addrObj as any).address || '').join(', ')
              : (parsed.to && (parsed.to as any).text) || '',
            text: parsed.text || '',
            html: parsed.html || '',
            folder: folder,
            account,
            date: parsed.date || new Date(),
            messageId: parsed.messageId,
          });
        } catch (err) {
          console.error(`❌ Failed to parse or index message:`, err);
        }
      });
    });
  }
}