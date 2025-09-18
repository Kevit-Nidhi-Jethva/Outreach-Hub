import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template, TemplateDocument } from './schemas/template.schema';

@Injectable()
export class TemplatesService {
  constructor(@InjectModel(Template.name) private templateModel: Model<TemplateDocument>) {}

  async findAllByWorkspace(workspaceId: string): Promise<Template[]> {
    return this.templateModel.find({ workspaceId }).exec();
  }
}