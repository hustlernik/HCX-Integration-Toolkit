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

const CommunicationSchema = new Schema(
  {
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
  },
  { timestamps: true },
);

CommunicationSchema.virtual('sent')
  .get(function () {
    return this.sentAt;
  })
  .set(function (v) {
    this.sentAt = v;
  });

CommunicationSchema.virtual('received')
  .get(function () {
    return this.receivedAt;
  })
  .set(function (v) {
    this.receivedAt = v;
  });

CommunicationSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret: Record<string, any>) {
    if ('_id' in ret) {
      delete ret._id;
    }
    if ('__v' in ret) {
      delete ret.__v;
    }
    return ret;
  },
});

CommunicationSchema.set('toObject', {
  virtuals: true,
  transform: function (doc, ret: Record<string, any>) {
    if ('_id' in ret) {
      delete ret._id;
    }
    if ('__v' in ret) {
      delete ret.__v;
    }
    return ret;
  },
});

export type ICommunication = InferSchemaType<typeof CommunicationSchema>;
export default mongoose.model<ICommunication>('Communication', CommunicationSchema);
