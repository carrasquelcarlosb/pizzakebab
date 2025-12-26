export interface MenuItemFixture {
  resourceId: string;
  name: string;
  description?: string;
  nameKey: string;
  descriptionKey: string;
  categoryKey: string;
  price: number;
  currency: string;
  imageUrl?: string;
  rating?: number;
  discountPercentage?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export interface MenuFixture {
  resourceId: string;
  name: string;
  description?: string;
  translationKey: string;
  isActive: boolean;
  items: MenuItemFixture[];
}

const BASE_IMAGE = '/placeholder.svg?height=300&width=300';

export const menuFixtures: MenuFixture[] = [
  {
    resourceId: 'pizzas',
    name: 'Pizzas',
    description: 'Handcrafted pizzas with bold Mediterranean flavours.',
    translationKey: 'categories.pizzas',
    isActive: true,
    items: [
      {
        resourceId: '101',
        name: 'Spicy Kebab Pizza',
        description: 'Signature pizza topped with juicy kebab meat and special spicy sauce.',
        nameKey: 'food.spicyKebabPizza.name',
        descriptionKey: 'food.spicyKebabPizza.description',
        categoryKey: 'common.specialtyPizzas',
        price: 14.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.8,
        isPopular: true,
      },
      {
        resourceId: '102',
        name: 'Margherita',
        description: 'Classic pizza with tomato sauce, mozzarella and fresh basil.',
        nameKey: 'food.margherita.name',
        descriptionKey: 'food.margherita.description',
        categoryKey: 'common.classicPizzas',
        price: 11.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.6,
      },
      {
        resourceId: '103',
        name: 'Meat Feast Pizza',
        description: 'Loaded with pepperoni, sausage, bacon and ground beef.',
        nameKey: 'food.meatFeastPizza.name',
        descriptionKey: 'food.meatFeastPizza.description',
        categoryKey: 'common.specialtyPizzas',
        price: 15.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        discountPercentage: 10,
        rating: 4.9,
      },
      {
        resourceId: '104',
        name: 'Veggie Supreme',
        description: 'Topped with peppers, onions, mushrooms and olives.',
        nameKey: 'food.veggieSupreme.name',
        descriptionKey: 'food.veggieSupreme.description',
        categoryKey: 'common.vegetarian',
        price: 13.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.4,
      },
    ],
  },
  {
    resourceId: 'kebabs',
    name: 'Kebabs',
    description: 'Char-grilled kebabs served with fresh accompaniments.',
    translationKey: 'categories.kebabs',
    isActive: true,
    items: [
      {
        resourceId: '201',
        name: 'Mixed Grill Kebab',
        description: 'A mix of chicken, beef and lamb kebab with grilled vegetables.',
        nameKey: 'food.mixedGrillKebab.name',
        descriptionKey: 'food.mixedGrillKebab.description',
        categoryKey: 'categories.kebabs',
        price: 16.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.7,
      },
      {
        resourceId: '202',
        name: 'Chicken Shish',
        description: 'Marinated chicken pieces grilled to perfection.',
        nameKey: 'food.chickenShish.name',
        descriptionKey: 'food.chickenShish.description',
        categoryKey: 'categories.kebabs',
        price: 13.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.5,
      },
      {
        resourceId: '203',
        name: 'Lamb Kofte',
        description: 'Seasoned minced lamb formed into kebabs and grilled.',
        nameKey: 'food.lambKofte.name',
        descriptionKey: 'food.lambKofte.description',
        categoryKey: 'categories.kebabs',
        price: 14.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        discountPercentage: 15,
        rating: 4.8,
      },
      {
        resourceId: '204',
        name: 'Vegetable Kebab',
        description: 'Grilled seasonal vegetables with halloumi cheese.',
        nameKey: 'food.vegetableKebab.name',
        descriptionKey: 'food.vegetableKebab.description',
        categoryKey: 'common.vegetarian',
        price: 12.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.3,
      },
    ],
  },
  {
    resourceId: 'wraps',
    name: 'Wraps',
    description: 'Warm wraps packed with bold fillings.',
    translationKey: 'categories.wraps',
    isActive: true,
    items: [
      {
        resourceId: '301',
        name: 'Chicken Shawarma Wrap',
        description: 'Tender chicken shawarma with vegetables and garlic sauce.',
        nameKey: 'food.chickenShawarmaWrap.name',
        descriptionKey: 'food.chickenShawarmaWrap.description',
        categoryKey: 'categories.wraps',
        price: 9.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.6,
      },
      {
        resourceId: '302',
        name: 'Lamb Doner Wrap',
        description: 'Sliced lamb doner with lettuce, tomato and tzatziki.',
        nameKey: 'food.lambDonerWrap.name',
        descriptionKey: 'food.lambDonerWrap.description',
        categoryKey: 'categories.wraps',
        price: 10.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.4,
      },
      {
        resourceId: '303',
        name: 'Falafel Wrap',
        description: 'Crispy falafel with tahini sauce and fresh vegetables.',
        nameKey: 'food.falafelWrap.name',
        descriptionKey: 'food.falafelWrap.description',
        categoryKey: 'common.vegetarian',
        price: 8.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.4,
        isNew: true,
      },
    ],
  },
  {
    resourceId: 'sides',
    name: 'Sides',
    description: 'Perfect complements to any meal.',
    translationKey: 'categories.sides',
    isActive: true,
    items: [
      {
        resourceId: '401',
        name: 'Garlic Cheese Bread',
        description: 'Freshly baked bread topped with garlic butter and cheese.',
        nameKey: 'food.garlicCheeseBread.name',
        descriptionKey: 'food.garlicCheeseBread.description',
        categoryKey: 'categories.sides',
        price: 5.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.5,
      },
      {
        resourceId: '402',
        name: 'Spicy Potato Wedges',
        description: 'Crispy potato wedges seasoned with spicy herbs.',
        nameKey: 'food.spicyPotatoWedges.name',
        descriptionKey: 'food.spicyPotatoWedges.description',
        categoryKey: 'categories.sides',
        price: 4.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.2,
      },
    ],
  },
  {
    resourceId: 'drinks',
    name: 'Drinks',
    description: 'Refreshments to keep you cool.',
    translationKey: 'categories.drinks',
    isActive: true,
    items: [
      {
        resourceId: '501',
        name: 'Classic Cola',
        description: 'Refreshing fizzy cola served chilled.',
        nameKey: 'food.classicCola.name',
        descriptionKey: 'food.classicCola.description',
        categoryKey: 'categories.drinks',
        price: 2.99,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.1,
      },
      {
        resourceId: '502',
        name: 'Sparkling Water',
        description: 'Lightly carbonated mineral water with a slice of lemon.',
        nameKey: 'food.sparklingWater.name',
        descriptionKey: 'food.sparklingWater.description',
        categoryKey: 'categories.drinks',
        price: 2.49,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.0,
      },
    ],
  },
  {
    resourceId: 'desserts',
    name: 'Desserts',
    description: 'Sweet treats to finish your meal.',
    translationKey: 'categories.desserts',
    isActive: true,
    items: [
      {
        resourceId: '601',
        name: 'Baklava',
        description: 'Layers of flaky pastry with nuts and honey syrup.',
        nameKey: 'food.baklava.name',
        descriptionKey: 'food.baklava.description',
        categoryKey: 'categories.desserts',
        price: 4.49,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.7,
      },
      {
        resourceId: '602',
        name: 'Tiramisu',
        description: 'Classic Italian dessert with mascarpone and espresso.',
        nameKey: 'food.tiramisu.name',
        descriptionKey: 'food.tiramisu.description',
        categoryKey: 'categories.desserts',
        price: 5.49,
        currency: 'USD',
        imageUrl: BASE_IMAGE,
        rating: 4.6,
      },
    ],
  },
];

