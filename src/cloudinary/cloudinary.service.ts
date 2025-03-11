import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';

@Injectable()
export class CloudinaryService {
  private readonly logger: Logger;
  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(CloudinaryService.name);
    cloudinary.config({
      cloud_name: this.configService.getOrThrow('CLOUD_NAME'),
      api_key: this.configService.getOrThrow('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    image: Express.Multer.File,
  ): Promise<UploadApiResponse | { secure_url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `${image.originalname}-${randomUUID}`,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            this.logger.error(error);
            return reject(
              new InternalServerErrorException('Image upload failed'),
            );
          }
          if (!result)
            return reject(
              new InternalServerErrorException('Image upload failed'),
            );

          resolve(result);
        },
      );
      const readableStream = new Readable();
      readableStream._read = () => {};
      readableStream.push(image.buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }
}
