// run: node seed/seedCategories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/category.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/evio_services_dev';

const categories = [
  { name: 'Plumbing', slug: 'plumbing', description: 'All plumbing related services' },
  { name: 'Electrical', slug: 'electrical', description: 'Electrical repairs & installations' },
  { name: 'AC Repair', slug: 'ac-repair', description: 'Air conditioner servicing & repair' },
  { name: 'Appliance Repair', slug: 'appliance-repair', description: 'Fridge, washing machine repairs' },
  { name: 'Car Wash', slug: 'car-wash', description: 'Car cleaning services' },
  { name: 'Pest Control', slug: 'pest-control', description: 'Termite & pest control' },
  { name: 'Painting', slug: 'painting', description: 'Home & office painting' },
  { name: 'Carpentry', slug: 'carpentry', description: 'Carpentry works' },
  { name: 'Home Cleaning', slug: 'home-cleaning', description: 'Housekeeping & deep cleaning' },
  { name: 'Salon & Beauty', slug: 'salon-beauty', description: 'Home salon & beauty services' }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('connected to', MONGO_URI);
  for (const c of categories) {
    try {
      const exists = await Category.findOne({ slug: c.slug });
      if (!exists) {
        await Category.create(c);
        console.log('created', c.slug);
      } else {
        console.log('exists', c.slug);
      }
    } catch (err) {
      console.error('error', err);
    }
  }
  await mongoose.disconnect();
  console.log('done');
}

seed();
