import { inspect } from 'util';
import dotenv from 'dotenv';
import Imap from 'node-imap';
import { indexEmail } from '../utils/indexemail';
import{simpleParser} from 'mailparser';
dotenv.config();

export class ImapService {
  private imap: Imap;
  private lastSeenUID: number = 0;

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
      this.openInbox((err, box) => {
        if (err) throw err;
        console.log('📥 INBOX opened. Total messages:', box.messages.total);

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 1);

        const searchCriteria = ['ALL', ['SINCE', sinceDate.toISOString()]];
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true,
        };

        this.imap.search(searchCriteria, (err, results) => {
          if (err) throw err;

          if (!results.length) {
            console.log('No emails from the last 30 days.');
          } else {
            console.log(`Found ${results.length} emails from the last 30 days.`);

            const f = this.imap.fetch(results, fetchOptions);
            f.on('message', (msg, seqno) => {
              msg.once('attributes', (attrs) => {
                if (attrs.uid > this.lastSeenUID) {
                  this.lastSeenUID = attrs.uid;
                }
              });
              this.handleMessage(msg, seqno, this.user, 'INBOX');
            });

            f.once('end', () => {
            });
          }
        });

        this.imap.on('mail', (numNewMsgs: number) => {
          console.log(`${numNewMsgs} new message(s) arrived!`);

          const startUID = this.lastSeenUID + 1;
          const endUID = startUID + numNewMsgs - 1;

          const fetch = this.imap.fetch(`${startUID}:${endUID}`, fetchOptions);

          fetch.on('message', (msg, seqno) => {
            msg.once('attributes', (attrs) => {
              if (attrs.uid > this.lastSeenUID) {
                this.lastSeenUID = attrs.uid;
              }
            });
            this.handleMessage(msg, seqno, this.user, 'INBOX');
          });

          fetch.once('error', (err: Error) => {
            console.error('Realtime fetch error:', err);
          });

          fetch.once('end', () => {
           });
        });
      });
    });

    this.imap.once('error', (err: Error) => {
      });

    this.imap.once('end', () => {
      console.log('IMAP connection closed.');
    });

    this.imap.connect();
  }

  private handleMessage(msg: Imap.ImapMessage, seqno: number, account: string, folder: string): void {
    let buffer = '';

    msg.on('body', (stream, info) => {
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });

      stream.on('end', async () => {
        try {
          const parsed = await simpleParser(buffer);
          await indexEmail({
            subject: parsed.subject,
            from: parsed.from?.text,
            to: Array.isArray(parsed.to)
              ? parsed.to.map(addr => addr.text).join(', ')
              : parsed.to?.text || '',
            text: parsed.text,
            html: parsed.html,
            folder,
            account,
            date: parsed.date || new Date(),
            messageId: parsed.messageId,
          });

          console.log(`Email indexed to Elasticsearch: ${parsed.subject}`);
        } catch (err) {
          console.error('Failed to parse or index message:', err);
        }
      });
    });
    msg.once('attributes', (attrs) => {
      console.log('📎 Attributes:', inspect(attrs, false, 8, true));
    });

    msg.once('end', () => {
      console.log(`Finished message #${seqno}`);
    });
  }

  private isPrintable(str: string): boolean {
    return /^[\x20-\x7E\s]*$/.test(str);
  }
}
