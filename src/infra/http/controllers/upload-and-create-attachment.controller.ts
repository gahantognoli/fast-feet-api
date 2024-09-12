import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UploadAndCreateAttachmentUseCase } from '@/domain/delivery/application/use-cases/upload-and-create-attachment';
import { InvalidAttachmentTypeError } from '@/domain/delivery/application/use-cases/errors/invalid-attachment-type-error';

class AttachmentResponseDto {
  @ApiProperty()
  attachmentId: string;
}

@ApiTags('orders')
@ApiBearerAuth('deliverymanToken')
@Controller('/orders/:orderId/attachment')
export class UploadAndCreateAttachmentController {
  constructor(
    private uploadAndCreateAttachment: UploadAndCreateAttachmentUseCase,
  ) {}

  @ApiOperation({
    summary: 'Upload and create an order attachment',
    description:
      'Upload and create an order attachment when the courier carries out the delivery.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Attachment id',
    type: AttachmentResponseDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @Param('orderId') orderId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({
            fileType: '.(png|jpg|jpeg|pdf)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.uploadAndCreateAttachment.execute({
      orderId,
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidAttachmentTypeError:
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { attachment } = result.value;

    return {
      attachmentId: attachment.id.toString(),
    };
  }
}
