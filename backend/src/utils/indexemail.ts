import { esClient } from '../services/elasticsearch';

export async function indexEmail(email: any) {
  await esClient.index({
    index: 'emails',
    document: {
      subject: email.subject,
      from: email.from?.text,
      to: email.to?.text || '',
      text: email.text,
      html: email.html,
      folder: email.folder,
      account: email.account,
      date: email.date || new Date(),
      messageId: email.messageId,
    }
  });
console.log("Email object structure:", JSON.stringify(email, null, 2));


}
