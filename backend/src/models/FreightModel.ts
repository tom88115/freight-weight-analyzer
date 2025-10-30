import mongoose, { Schema, Document } from 'mongoose';
import { FreightRecord } from '../types';

export interface IFreightRecord extends Omit<FreightRecord, 'id'>, Document {}

const FreightRecordSchema: Schema = new Schema(
  {
    orderNumber: { type: String },
    weight: { type: Number, required: true },
    cost: { type: Number, required: true },
    destination: { type: String },
    carrier: { type: String },
    date: { type: Date, required: true, default: Date.now },
    weightRange: { type: String, required: true },
    remarks: { type: String },
  },
  {
    timestamps: true,
  }
);

// 创建索引以提高查询性能
FreightRecordSchema.index({ date: -1 });
FreightRecordSchema.index({ weightRange: 1 });
FreightRecordSchema.index({ carrier: 1 });

export default mongoose.model<IFreightRecord>('FreightRecord', FreightRecordSchema);

