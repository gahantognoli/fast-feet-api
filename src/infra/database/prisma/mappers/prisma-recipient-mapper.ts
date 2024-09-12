import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Recipient } from '@/domain/delivery/enterprise/entities/recipient';
import { Prisma, Shipping as PrismaShipping } from '@prisma/client';

export class PrismaRecipientMapper {
  static toDomain(raw: PrismaShipping): Recipient {
    return Recipient.create(
      {
        name: raw.clientName,
        email: raw.clientEmail,
        zipcode: raw.clientZipcode,
        address: raw.clientAddress,
        neighborhood: raw.clientNeighborhood,
        city: raw.clientCity,
        state: raw.clientState,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(recipient: Recipient): Prisma.ShippingUncheckedCreateInput {
    return {
      id: recipient.id.toString(),
      clientName: recipient.name,
      clientEmail: recipient.email,
      clientZipcode: recipient.zipcode,
      clientAddress: recipient.address,
      clientNeighborhood: recipient.neighborhood,
      clientCity: recipient.city,
      clientState: recipient.state,
    };
  }
}
