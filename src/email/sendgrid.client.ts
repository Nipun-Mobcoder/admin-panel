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
    email: string,
    subject: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      const templatePath = path.join(__dirname, 'mailTemplates', fileName);
      const emailHTML = await ejs.renderFile(templatePath, data);

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
