// seedCategories.js
const mongoose = require('mongoose');
const Category = require('./models/Category'); // Adjust path if needed
require('dotenv').config();

const categories = [
  { name: 'Technology' },
  { name: 'Lifestyle' },
  { name: 'Travel' },
  { name: 'Food' },
  { name: 'Health' },
  { name: 'Business' },
  { name: 'Entertainment' },
  { name: 'Sports' }
];

// Function to generate slug from name (same logic as your pre-save hook)
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Add slugs to each category before inserting
    const categoriesWithSlugs = categories.map(category => ({
      ...category,
      slug: generateSlug(category.name)
    }));

    console.log('Categories to be created:');
    categoriesWithSlugs.forEach(cat => {
      console.log(`   - ${cat.name} (slug: ${cat.slug})`);
    });

    // Insert new categories with slugs
    const createdCategories = await Category.insertMany(categoriesWithSlugs);
    console.log('\n✅ Successfully seeded categories:');
    createdCategories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat._id}, Slug: ${cat.slug})`);
    });

    console.log(`\n📊 Total categories created: ${createdCategories.length}`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedCategories();
}

module.exports = seedCategories;