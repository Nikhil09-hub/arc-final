const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');

const seedPaymentTestEvent = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const eventData = {
    title: 'VJ ARC Payment Test Event',
    slug: 'vj-arc-payment-test-event',
    category: 'other',
    shortDescription: 'Admin-only fee test event for registration configuration.',
    description: 'This event is only for validating the paid registration configuration UI and backend fee calculation.',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 172800000).toISOString(),
    venue: 'VJ ARC Office',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    visibility: 'admin',
    registration: {
      enabled: true,
      type: 'internal',
      format: 'team',
      startDate: new Date(Date.now() - 3600000).toISOString(),
      endDate: new Date(Date.now() + 777600000).toISOString(),
      team: {
        minimumMembers: 2,
        maximumMembers: 4,
        teamNameEnabled: true,
        teamNameRequired: true,
      },
      payment: {
        enabled: true,
        amount: 50,
        currency: 'INR',
        feeType: 'per_team',
      },
    },
  };

  const result = await Event.findOneAndUpdate(
    { slug: eventData.slug },
    { $set: eventData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Seeded test event: ${result.slug} (${result.visibility})`);
  return result;
};

seedPaymentTestEvent()
  .then(() => mongoose.disconnect())
  .catch((error) => {
    console.error('Failed to seed payment test event:', error.message);
    process.exit(1);
  });
