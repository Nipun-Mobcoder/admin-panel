import { Module } from '@nestjs/common';
import { SendGridClient } from './sendgrid.client';

@Module({
  providers: [SendGridClient],
  exports: [SendGridClient],
})
export class SendGridModule {}
