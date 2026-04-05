export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
};

export const categories = [
  "All",
  "Vinyls",
  "Antique Furniture",
  "GPS Sport Watches",
  "Running Shoes",
  "Camping Tents",
];

export const products: Product[] = [
  // Vinyls
  { id: 1, name: "Abbey Road – The Beatles", category: "Vinyls", price: 34.99, image: "🎵" },
  { id: 2, name: "Dark Side of the Moon – Pink Floyd", category: "Vinyls", price: 29.99, image: "🎵" },
  { id: 3, name: "Rumours – Fleetwood Mac", category: "Vinyls", price: 27.99, image: "🎵" },

  // Antique Furniture
  { id: 4, name: "Victorian Oak Writing Desk", category: "Antique Furniture", price: 1249.00, image: "🪑" },
  { id: 5, name: "Art Deco Walnut Cabinet", category: "Antique Furniture", price: 899.00, image: "🪑" },
  { id: 6, name: "Georgian Mahogany Bookcase", category: "Antique Furniture", price: 1599.00, image: "🪑" },

  // GPS Sport Watches
  { id: 7, name: "Garmin Forerunner 265", category: "GPS Sport Watches", price: 449.99, image: "⌚" },
  { id: 8, name: "Polar Vantage V3", category: "GPS Sport Watches", price: 499.99, image: "⌚" },
  { id: 9, name: "Suunto Race S", category: "GPS Sport Watches", price: 399.99, image: "⌚" },

  // Running Shoes
  { id: 10, name: "Nike Pegasus 41", category: "Running Shoes", price: 129.99, image: "👟" },
  { id: 11, name: "Adidas Ultraboost Light", category: "Running Shoes", price: 189.99, image: "👟" },
  { id: 12, name: "New Balance Fresh Foam X", category: "Running Shoes", price: 159.99, image: "👟" },

  // Camping Tents
  { id: 13, name: "MSR Hubba Hubba 2-Person", category: "Camping Tents", price: 479.99, image: "⛺" },
  { id: 14, name: "REI Half Dome SL 3+", category: "Camping Tents", price: 349.99, image: "⛺" },
  { id: 15, name: "Big Agnes Copper Spur HV UL2", category: "Camping Tents", price: 449.99, image: "⛺" },
];
