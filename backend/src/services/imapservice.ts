// // import { inspect } from 'util';
// // import dotenv from 'dotenv';
// // const Imap = require('node-imap');

// // dotenv.config();

// // export class ImapService {
// //   private imap: any;

// //   constructor(
// //     private user: string,
// //     private password: string,
// //     private host: string = 'imap.gmail.com',
// //     private port: number = 993,
// //     private tls: boolean = true
// //   ) {
// //     this.imap = new Imap({
// //       user: this.user,
// //       password: this.password,
// //       host: this.host,
// //       port: this.port,
// //       tls: this.tls,
// //     });
// //   }

// //   private isPrintable(str: string): boolean {
// //     return /^[\x20-\x7E\s]*$/.test(str);
// //   }

// //   private openInbox(cb: (err: Error | null, box: any) => void) {
// //     this.imap.openBox('INBOX', false, cb);
// //   }

// //   public connectrealtime(): void {
// //     this.imap.once('ready', () => {
// //       this.openInbox((err, box) => {
// //         if (err) throw err;
// //         console.log('Inbox opened:', inspect(box, false, 8, true));
// //         const date = new Date();
// //         date.setDate(date.getDate() - 30);
// //         const searchmail = ['ALL', ['SINCE', date.toISOString()]];
// //         this.imap.search(searchmail, (err: Error, results: any[]) => {
// //             if(err) throw err;
// //             if (!results || results.length === 0) {
// //               console.log('No new emails found.');
// //               return;
// //             }
// //             const temp = this.imap.seq.fetch(results, {
// //               bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', '1'],
// //               struct: true, 
// //       });
// //       temp.on('message', (msg: any, seqno: number) => {
// //         this.handleMessage(msg, seqno);
// //         });
// //         temp.once('end', () => {
// //           console.log('✅ Initial 30-day email fetch complete.');
// //         });
// //       });
// //       this.imap.on('mail', (newMailCount: number) => {
// //         console.log(`🔔 New email detected (${newMailCount} message(s))`);
// //         const fetch = this.imap.seq.fetch(`${box.messages.total + 1}:${box.messages.total + newMailCount}`, {
// //           bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
// //           struct: true,
// //         });

// //         fetch.on('message', (msg: any, seqno: number) => {
// //           console.log(`📩 [Realtime] Email #${seqno}`);
// //           this.handleMessage(msg, seqno);
// //         });
// //       });
// //     });
// //   });

// //     this.imap.once('error', (err: Error) => {
// //       console.error('IMAP connection error:', err);
// //     });

// //     this.imap.once('end', () => {
// //       console.log('🔚 IMAP connection closed.');
// //     });

// //     this.imap.connect();
// //   }

// //   private handleMessage(msg: any, seqno: number): void {
// //   const prefix = `(#${seqno}) `;
// //   msg.on('body', (stream: any, info: any) => {
// //     let buffer = '';
// //     stream.on('data', (chunk: any) => {
// //       buffer += chunk.toString('utf8');
// //     });

// //     stream.once('end', () => {
// //       if (info.which === 'TEXT' || info.which === '1') {
// //         const decodedBody = Buffer.from(buffer, 'base64').toString('utf8');
// //         if (this.isPrintable(decodedBody)) {
// //           console.log(prefix + '📄 Body:\n' + decodedBody);
// //         } else {
// //           console.log(prefix + '🔐 Encoded Body:\n' + buffer);
// //         }
// //       } else {
// //         const headers = Imap.parseHeader(buffer);
// //         console.log(prefix + '📨 Header:', headers);
// //       }
// //     });
// //   });
// // }

// // }
// import { inspect } from 'util';
// import dotenv from 'dotenv';
// import Imap from 'node-imap';

// dotenv.config();

// export class ImapService {
//   private imap: Imap;

//   constructor(
//     private user: string,
//     private password: string,
//     private host: string = 'imap.gmail.com',
//     private port: number = 993,
//     private tls: boolean = true
//   ) {
//     this.imap = new Imap({
//       user: this.user,
//       password: this.password,
//       host: this.host,
//       port: this.port,
//       tls: this.tls,
//       tlsOptions: { rejectUnauthorized: false }, // optional: helpful with Gmail
//     });
//   }

//   private openInbox(cb: (err: Error | null, box: Imap.Box) => void) {
//     this.imap.openBox('INBOX', false, cb);
//   }

//   public connectrealtime(): void {
//     this.imap.once('ready', () => {
//       this.openInbox((err, box) => {
//         if (err) throw err;
//         console.log('📥 INBOX opened. Total messages:', box.messages.total);

//         const sinceDate = new Date();
//         sinceDate.setDate(sinceDate.getDate() - 30);

//         const searchCriteria = ['ALL', ['SINCE', sinceDate.toISOString()]];
//         const fetchOptions = {
//           bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
//           struct: true,
//         };

//         this.imap.search(searchCriteria, (err, results) => {
//           if (err) throw err;

//           if (!results.length) {
//             console.log('📭 No emails from the last 30 days.');
//           } else {
//             console.log(`📩 Found ${results.length} emails from the last 30 days.`);
//             const f = this.imap.fetch(results, fetchOptions);
//             f.on('message', (msg, seqno) => this.handleMessage(msg, seqno));
//             f.once('end', () => {
//               console.log('✅ Initial fetch complete.');
//             });
//           }
//         });

//         // IDLE-based real-time mail detection
//         this.imap.on('mail', (numNewMsgs: number) => {
//   console.log(`🔔 ${numNewMsgs} new message(s) arrived!`);
  
//   this.imap.search(['UNSEEN'], (err, results) => {
//     if (err) {
//       console.error('Search error:', err);
//       return;
//     }

//     if (!results || results.length === 0) {
//       console.log('No unseen messages.');
//       return;
//     }

//     const fetch = this.imap.fetch(results, {
//       bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
//       struct: true,
//     });

//     fetch.on('message', (msg: any, seqno: number) => {
//       console.log(`📩 [Realtime] Email #${seqno}`);
//       this.handleMessage(msg, seqno);
//     });

//     fetch.once('error', (err: Error) => {
//       console.error('Fetch error:', err);
//     });

//     fetch.once('end', () => {
//       console.log('✅ Realtime fetch completed.');
//     });
//   });
// });

//       });
//     });

//     this.imap.once('error', (err: Error) => {
//       console.error('❌ IMAP Error:', err);
//     });

//     this.imap.once('end', () => {
//       console.log('🔌 IMAP connection closed.');
//     });

//     this.imap.connect();
//   }

//   private handleMessage(msg: Imap.ImapMessage, seqno: number): void {
//     console.log(`📥 Handling message #${seqno}`);
//     let buffer = '';
//     let header = '';

//     msg.on('body', (stream, info) => {
//       stream.on('data', (chunk) => {
//         buffer += chunk.toString('utf8');
//       });

//       stream.on('end', () => {
//         if (info.which === 'TEXT') {
//           const decoded = this.isPrintable(buffer)
//             ? buffer
//             : Buffer.from(buffer, 'base64').toString('utf8');

//           console.log(`📄 Body:\n${decoded}`);
//         } else {
//           const parsedHeader = Imap.parseHeader(buffer);
//           console.log('📨 Header:', parsedHeader);
//         }
//       });
//     });

//     msg.once('attributes', (attrs) => {
//       console.log('📎 Attributes:', inspect(attrs, false, 8, true));
//     });

//     msg.once('end', () => {
//       console.log(`✅ Finished message #${seqno}`);
//     });
//   }

//   private isPrintable(str: string): boolean {
//     return /^[\x20-\x7E\s]*$/.test(str);
//   }
// }
import { inspect } from 'util';
import dotenv from 'dotenv';
import Imap from 'node-imap';

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
        sinceDate.setDate(sinceDate.getDate() - 30);

        const searchCriteria = ['ALL', ['SINCE', sinceDate.toISOString()]];
        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          struct: true,
        };

        this.imap.search(searchCriteria, (err, results) => {
          if (err) throw err;

          if (!results.length) {
            console.log('📭 No emails from the last 30 days.');
          } else {
            console.log(`📩 Found ${results.length} emails from the last 30 days.`);

            const f = this.imap.fetch(results, fetchOptions);
            f.on('message', (msg, seqno) => {
              msg.once('attributes', (attrs) => {
                if (attrs.uid > this.lastSeenUID) {
                  this.lastSeenUID = attrs.uid;
                }
              });
              this.handleMessage(msg, seqno);
            });

            f.once('end', () => {
              console.log('✅ Initial fetch complete. Last UID:', this.lastSeenUID);
            });
          }
        });

        // Real-time new mail listener
        this.imap.on('mail', (numNewMsgs: number) => {
          console.log(`🔔 ${numNewMsgs} new message(s) arrived!`);

          const startUID = this.lastSeenUID + 1;
          const endUID = startUID + numNewMsgs - 1;

          const fetch = this.imap.fetch(`${startUID}:${endUID}`, fetchOptions);

          fetch.on('message', (msg, seqno) => {
            msg.once('attributes', (attrs) => {
              if (attrs.uid > this.lastSeenUID) {
                this.lastSeenUID = attrs.uid;
              }
            });
            console.log(`📩 [Realtime] Email #${seqno}`);
            this.handleMessage(msg, seqno);
          });

          fetch.once('error', (err: Error) => {
            console.error('Realtime fetch error:', err);
          });

          fetch.once('end', () => {
            console.log('✅ Realtime fetch complete. Last UID:', this.lastSeenUID);
          });
        });
      });
    });

    this.imap.once('error', (err: Error) => {
      console.error('❌ IMAP Error:', err);
    });

    this.imap.once('end', () => {
      console.log('🔌 IMAP connection closed.');
    });

    this.imap.connect();
  }

  private handleMessage(msg: Imap.ImapMessage, seqno: number): void {
    console.log(`📥 Handling message #${seqno}`);
    let buffer = '';

    msg.on('body', (stream, info) => {
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });

      stream.on('end', () => {
        if (info.which === 'TEXT') {
          const decoded = this.isPrintable(buffer)
            ? buffer
            : Buffer.from(buffer, 'base64').toString('utf8');

          console.log(`📄 Body:\n${decoded}`);
        } else {
          const parsedHeader = Imap.parseHeader(buffer);
          console.log('📨 Header:', parsedHeader);
        }
      });
    });

    msg.once('attributes', (attrs) => {
      console.log('📎 Attributes:', inspect(attrs, false, 8, true));
    });

    msg.once('end', () => {
      console.log(`✅ Finished message #${seqno}`);
    });
  }

  private isPrintable(str: string): boolean {
    return /^[\x20-\x7E\s]*$/.test(str);
  }
}
