// contact.service.ts
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
      workspaceId: new Types.ObjectId(createContactDto.workspaceId),
      createdBy: new Types.ObjectId(user.id || user.sub),
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

  // Find contacts created by the current user in a workspace
  async findMy(workspaceId: string, user: any): Promise<Contact[]> {
    const workspaceRole = user.workspaces.find(
      (ws) => ws.workspaceId.toString() === workspaceId,
    );

    if (!workspaceRole) {
      throw new ForbiddenException('You do not belong to this workspace');
    }

    // user id may be in user.id or user.sub
    const userId = user.id || user.sub;

    return this.contactModel
      .find({ workspaceId: new Types.ObjectId(workspaceId), createdBy: new Types.ObjectId(userId) })
      .populate('createdBy', 'name email')
      .exec();
  }
  // contacts.service.ts
  async findByUser(userId: string) {
    return this.contactModel.find({ createdBy: userId }).exec();
  }

  // contacts.service.ts
  async findByWorkspace(workspaceId: string) {
    return this.contactModel.find({ workspaceId }).populate('createdBy', 'username email');
  }

  async findMyContacts(workspaceId: string, userId: string) {
    return this.contactModel.find({ workspaceId, createdBy: userId });
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
