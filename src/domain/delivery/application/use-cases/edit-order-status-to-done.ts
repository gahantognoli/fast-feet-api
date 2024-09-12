import { Injectable } from '@nestjs/common';

import { OrdersRepository } from '../repositories/orders-repository';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { DeliveryMenRepository } from '../repositories/deliverymen-repository';

import { Order, Status } from '@/domain/delivery/enterprise/entities/order';

import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from '@/core/errors/not-allowed-error';

interface EditOrderStatusToDoneUseCaseRequest {
  orderId: string;
  deliverymanId: string;
}

type EditOrderStatusToDoneUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order;
  }
>;

@Injectable()
export class EditOrderStatusToDoneUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private deliveryMenRepository: DeliveryMenRepository,
    private attachmentRepository: AttachmentRepository,
  ) {}

  async execute({
    orderId,
    deliverymanId,
  }: EditOrderStatusToDoneUseCaseRequest): Promise<EditOrderStatusToDoneUseCaseResponse> {
    const deliveryman =
      await this.deliveryMenRepository.findById(deliverymanId);

    if (!deliveryman) {
      return left(new NotAllowedError());
    }

    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      return left(new ResourceNotFoundError());
    }

    if (order.status !== Status.PICKN_UP) {
      return left(new NotAllowedError());
    }

    if (order.deliverymanId?.toString() !== deliverymanId) {
      return left(new NotAllowedError());
    }

    const currentOrderAttachment =
      await this.attachmentRepository.findByOrderId(orderId);

    if (!currentOrderAttachment) {
      return left(new ResourceNotFoundError());
    }

    order.status = Status.DONE;

    await this.ordersRepository.save(order);

    return right({
      order,
    });
  }
}
