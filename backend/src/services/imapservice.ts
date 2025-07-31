import { inspect } from 'util';
import dotenv from 'dotenv';
import Imap from 'node-imap';
import { indexEmail } from '../utils/indexemail';
import{simpleParser} from 'mailparser';
import { htmlToText } from 'html-to-text';
import he from 'he';
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
    console.log(`🔌 Attempting to connect to IMAP: ${this.user}@${this.host}`);
    
    this.imap.once('ready', () => {
      console.log(`✅ IMAP connection ready for ${this.user}`);
      this.openInbox((err, box) => {
        if (err) {
          console.error(`❌ Error opening inbox for ${this.user}:`, err);
          throw err;
        }
        console.log(`📬 Total messages in inbox for ${this.user}:`, box.messages.total);

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 90);
        console.log(`🔍 Searching for emails since: ${sinceDate.toISOString()}`);

        const searchCriteria = ['ALL', ['SINCE', sinceDate.toISOString()]];
        const fetchOptions = {
          bodies: [],
          struct: true,
          attributes: ['UID']
        };

        this.imap.search(searchCriteria, (err, results) => {
          if (err) {
            console.error(`❌ Search error for ${this.user}:`, err);
            throw err;
          }

          if (!results.length) {
            console.log(`📭 No emails found for ${this.user} from the last 90 days.`);
          } else {
            console.log(`📧 Found ${results.length} emails for ${this.user} from the last 90 days.`);
            results.sort((a, b) => a - b);
            const f = this.imap.fetch(results, fetchOptions);
            f.on('message', (msg, seqno) => {
              console.log(`📨 Processing message #${seqno} for ${this.user}`);
              msg.once('attributes', (attrs) => {
                if (attrs.uid > this.lastSeenUID) {
                  this.lastSeenUID = attrs.uid;
                }
              });
              this.handleMessage(msg, seqno, this.user, 'INBOX');
            });

            f.once('end', () => {
              console.log(`✅ Finished fetching emails for ${this.user}`);
              this.startIdle();
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
      console.error(`❌ IMAP connection error for ${this.user}:`, err.message);
    });

    this.imap.once('end', () => {
      console.log(`🔌 IMAP connection closed for ${this.user}.`);
    });
    
    setTimeout(() => {
      console.log(`🔄 Attempting to reconnect IMAP for ${this.user}...`);
      this.imap.connect();
    }, 5000); 
    
    console.log(`🚀 Connecting to IMAP for ${this.user}...`);
    this.imap.connect();
  }

   private startIdle(): void {
    console.log('IMAP in IDLE mode, waiting for new mail...');
  }
  private handleMessage(msg: Imap.ImapMessage, seqno: number, account: string, folder: string): void {
    let buffer = '';
    console.log(`📨 Starting to process message #${seqno} for ${account}`);

    msg.on('body', (stream, info) => {
      console.log(`📥 Receiving body for message #${seqno}`);
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });

      stream.on('end', async () => {
        console.log(`📝 Finished receiving body for message #${seqno}, size: ${buffer.length} bytes`);
        try {
          const parsed = await simpleParser(buffer);
          
          // Always use decoded subject/from/to/text
          const subject = parsed.subject || '';
          const fromText = parsed.from?.text || '';
          const toText = parsed.to?.text || '';

          console.log(`📧 Parsed email for ${account}: Subject="${subject}", From="${fromText}"`);

          // Get clean text body
          let cleanText = parsed.text;
          if (!cleanText && parsed.html) {
            cleanText = htmlToText(parsed.html, { wordwrap: false });
          }
          if (cleanText) {
            cleanText = he.decode(cleanText);
          } else {
            cleanText = '';
          }

          await indexEmail({
            subject,
            from: fromText,
            to: toText,
            text: cleanText,
            html: parsed.html,
            folder,
            account,
            date: parsed.date || new Date(),
            messageId: parsed.messageId,
          });

          console.log(`✅ Email indexed to Elasticsearch for ${account}: ${subject}`);
        } catch (err) {
          console.error(`❌ Failed to parse or index message #${seqno} for ${account}:`, err);
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
