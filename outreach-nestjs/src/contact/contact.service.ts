import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contact } from './contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { User } from '../user/user.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name) private contactModel: Model<Contact>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // ✅ Create Contact
  async create(createContactDto: CreateContactDto, user: any): Promise<Contact> {
  if (!user.workspaces || !Array.isArray(user.workspaces)) {
    throw new ForbiddenException('User has no workspaces assigned');
  }

  const workspaceRole = user.workspaces.find(
    (ws) => ws.workspaceId.toString() === createContactDto.workspaceId,
  );

  if (!workspaceRole || workspaceRole.role !== 'Editor') {
    throw new ForbiddenException('Only editors can create contacts');
  }

  const createdContact = new this.contactModel({
    ...createContactDto,
    workspaceId: new this.contactModel.db.base.Types.ObjectId(
      createContactDto.workspaceId,
    ),
    // 🔹 Use user.sub (from JWT) if _id is missing
    createdBy: user.id || user.sub,
  });

  return await createdContact.save();
}


  // ✅ Find All Contacts for a Workspace
  async findAll(workspaceId: string, user: any): Promise<Contact[]> {
    const workspaceRole = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === workspaceId,
    );

    if (!workspaceRole) {
      throw new ForbiddenException('You do not belong to this workspace');
    }

    return this.contactModel
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .populate('createdBy', 'name email')
      .exec();
  }

  // ✅ Find Contact by ID
  async findOne(id: string, user: any): Promise<Contact> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid contact ID');
    }

    const contact = await this.contactModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const workspaceRole = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === contact.workspaceId.toString(),
    );

    if (!workspaceRole) {
      throw new ForbiddenException('You do not belong to this workspace');
    }

    return contact;
  }

  // ✅ Update Contact
  async update(id: string, updateContactDto: UpdateContactDto, user: any): Promise<Contact> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid contact ID');
    }

    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');

    const workspaceRole = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === contact.workspaceId.toString(),
    );

    if (!workspaceRole || workspaceRole.role !== 'Editor') {
      throw new ForbiddenException('Only editors can update contacts');
    }

    Object.assign(contact, updateContactDto);
    return contact.save();
  }

  // ✅ Delete Contact
  async remove(id: string, user: any): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid contact ID');
    }

    const contact = await this.contactModel.findById(id);
    if (!contact) throw new NotFoundException('Contact not found');

    const workspaceRole = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === contact.workspaceId.toString(),
    );

    if (!workspaceRole || workspaceRole.role !== 'Editor') {
      throw new ForbiddenException('Only editors can delete contacts');
    }

    await this.contactModel.deleteOne({ _id: id });
    return { message: 'Contact deleted successfully' };
  }
}
