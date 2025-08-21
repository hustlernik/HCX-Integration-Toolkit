import mongoose, { Schema, InferSchemaType } from 'mongoose';

const AttachmentSchema = new Schema({
  contentType: { type: String },
  url: { type: String },
  title: { type: String },
  size: { type: Number },
});

const PayloadSchema = new Schema({
  contentString: { type: String },
  contentAttachment: AttachmentSchema,
  contentCodeableConcept: {
    coding: [
      {
        system: { type: String },
        code: { type: String },
        display: { type: String },
      },
    ],
  },
});

const CommunicationSchema = new Schema({
  communicationId: { type: String, required: true, unique: true },
  correlationId: { type: String, required: true },
  fhirRefId: { type: String },
  status: {
    type: String,
    enum: [
      'preparation',
      'in-progress',
      'not-done',
      'on-hold',
      'stopped',
      'completed',
      'entered-in-error',
      'unknown',
    ],
    default: 'in-progress',
  },
  category: [
    {
      coding: [
        {
          system: { type: String },
          code: { type: String },
          display: { type: String },
        },
      ],
    },
  ],
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'asap', 'stat'],
    default: 'routine',
  },
  subject: {
    reference: { type: String },
    display: { type: String },
  },
  about: [
    {
      reference: { type: String },
      display: { type: String },
    },
  ],
  sender: {
    reference: { type: String },
    display: { type: String },
  },

  recipient: [
    {
      reference: { type: String },
      display: { type: String },
    },
  ],
  reasonCode: [
    {
      coding: [
        {
          system: {
            type: String,
            default: 'http://terminology.hl7.org/CodeSystem/communication-category',
          },
          code: { type: String },
          display: { type: String },
        },
      ],
    },
  ],
  payload: [PayloadSchema],
  sentAt: { type: Date },
  receivedAt: { type: Date },
  communicationType: {
    type: String,
    enum: ['request', 'response'],
    required: true,
  },

  parentCommunicationId: { type: String },

  workflowStatus: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-review', 'responded', 'completed'],
    default: 'pending',
  },

  dueDate: { type: Date },

  requestedDocuments: [
    {
      type: { type: String },
      description: { type: String },
      required: { type: Boolean, default: false },
    },
  ],

  responseAttachments: [AttachmentSchema],

  internalNotes: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type ICommunication = InferSchemaType<typeof CommunicationSchema>;
export default mongoose.model<ICommunication>('Communication', CommunicationSchema);
