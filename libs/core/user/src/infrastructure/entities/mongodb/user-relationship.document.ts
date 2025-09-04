import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * MongoDB用户关系文档实体
 */
@Schema({
  collection: 'user_relationships',
  timestamps: true,
  versionKey: false,
})
export class UserRelationshipDocument extends Document {
  @Prop({ required: true, unique: true })
  relationshipId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  relatedUserId!: string;

  @Prop({
    required: true,
    enum: ['FRIEND', 'COLLEAGUE', 'MANAGER', 'SUBORDINATE', 'MENTOR', 'MENTEE'],
  })
  relationshipType!: string;

  @Prop({
    required: true,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'],
  })
  status!: string;

  @Prop()
  notes?: string;

  @Prop()
  mutualConnection?: boolean;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;
}

export const UserRelationshipSchema = SchemaFactory.createForClass(
  UserRelationshipDocument,
);

// 创建索引
UserRelationshipSchema.index({ relationshipId: 1 }, { unique: true });
UserRelationshipSchema.index({ userId: 1 });
UserRelationshipSchema.index({ relatedUserId: 1 });
UserRelationshipSchema.index({ relationshipType: 1 });
UserRelationshipSchema.index({ status: 1 });
UserRelationshipSchema.index({ createdAt: 1 });
UserRelationshipSchema.index({ userId: 1, relatedUserId: 1 });
UserRelationshipSchema.index({ userId: 1, relationshipType: 1, status: 1 });
