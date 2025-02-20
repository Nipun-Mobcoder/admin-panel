import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import * as path from 'path';
import * as ejs from 'ejs';

@Injectable()
export class SendGridClient {
  private logger: Logger = new Logger(SendGridClient.name);
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.getOrThrow('SENDGRID_API_KEY'));
  }

  async send(
    fileName: string,
    userName: string,
    email: string,
    url: string,
    subject: string,
  ): Promise<void> {
    try {
      console.log(__dirname, path)
      const templatePath = path.join("/home/mobcoder/Desktop/admin-panel", "src/email/mailTemplates", fileName);
      console.log(templatePath)
      const emailHTML = await ejs.renderFile(templatePath, {
        userName,
        email,
        url,
      });
      console.log(emailHTML)
      const mail = {
        to: email,
        from: {
          name: 'Admin',
          email: this.configService.getOrThrow('ADMIN_EMAIL'),
        },
        subject,
        html: emailHTML,
      };
      await SendGrid.send(mail);
      this.logger.log(`Email successfully dispatched to ${mail.to as string}`);
    } catch (error) {
      this.logger.error('Error while sending email', error);
      throw error;
    }
  }
}
