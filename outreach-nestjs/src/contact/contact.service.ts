import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact } from './contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(dto: CreateContactDto, user: any) {
    const existing = await this.contactModel.findOne({
      workspaceId: dto.workspaceId,
      phoneNumber: dto.phoneNumber,
    });
    if (existing) {
      throw new ConflictException('Contact already exists with this phone number in the workspace.');
    }

    const contact = new this.contactModel({
      ...dto,
      createdBy: user.userId,
    });

    return contact.save();
  }

  async findAll(query: any) {
    const { workspaceId, tag, search, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (workspaceId) filter.workspaceId = new Types.ObjectId(workspaceId);
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    return this.contactModel
      .find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit);
  }

  async findOne(id: string) {
    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, dto: UpdateContactDto, user: any) {
    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');

    if (contact.createdBy.toString() !== user.userId) {
      throw new ForbiddenException('Unauthorized');
    }

    Object.assign(contact, dto);
    return contact.save();
  }

  async remove(id: string, user: any) {
    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');

    if (contact.createdBy.toString() !== user.userId) {
      throw new ForbiddenException('Unauthorized');
    }

    await contact.deleteOne();
    return { message: 'Contact deleted' };
  }
}
