import { FastifyInstance } from 'fastify';

import { MenuDocument, MenuItemDocument } from '../db/schemas';

const menuItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    legacyId: { type: 'integer' },
    menuId: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    nameKey: { type: 'string' },
    descriptionKey: { type: 'string' },
    categoryKey: { type: 'string' },
    price: { type: 'number' },
    currency: { type: 'string' },
    imageUrl: { type: 'string' },
    rating: { type: 'number' },
    discountPercentage: { type: 'number' },
    isPopular: { type: 'boolean' },
    isNew: { type: 'boolean' },
    isAvailable: { type: 'boolean' },
  },
  required: ['id', 'menuId', 'price', 'currency', 'isAvailable'],
  additionalProperties: false,
} as const;

const menuSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    translationKey: { type: 'string' },
    isActive: { type: 'boolean' },
    items: { type: 'array', items: menuItemSchema },
  },
  required: ['id', 'name', 'isActive', 'items'],
  additionalProperties: false,
} as const;

const formatMenuItem = (doc: MenuItemDocument) => {
  const legacyId = Number.parseInt(doc.resourceId, 10);
  return {
    id: doc.resourceId,
    legacyId: Number.isFinite(legacyId) ? legacyId : undefined,
    menuId: doc.menuId,
    name: doc.name,
    description: doc.description,
    nameKey: doc.nameKey,
    descriptionKey: doc.descriptionKey,
    categoryKey: doc.categoryKey,
    price: doc.price,
    currency: doc.currency,
    imageUrl: doc.imageUrl,
    rating: doc.rating,
    discountPercentage: doc.discountPercentage,
    isPopular: doc.isPopular ?? false,
    isNew: doc.isNew ?? false,
    isAvailable: doc.isAvailable,
  };
};

const formatMenu = (doc: MenuDocument, items: MenuItemDocument[]) => ({
  id: doc.resourceId,
  name: doc.name,
  description: doc.description,
  translationKey: doc.translationKey,
  isActive: doc.isActive,
  items: items
    .map(formatMenuItem)
    .sort((a, b) => {
      if (a.legacyId && b.legacyId) {
        return a.legacyId - b.legacyId;
      }
      return a.name.localeCompare(b.name);
    }),
});

const responseSchema = {
  200: {
    type: 'object',
    properties: {
      menus: {
        type: 'array',
        items: menuSchema,
      },
    },
    required: ['menus'],
  },
} as const;

export default async function menusRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/menus',
    {
      schema: {
        response: responseSchema,
      },
    },
    async (request) => {
      const collections = await request.getTenantCollections();

      const [menus, menuItems] = await Promise.all([
        collections.menus.find({ isActive: true }).toArray(),
        collections.menuItems.find({}).toArray(),
      ]);

      const itemsByMenu = new Map<string, MenuItemDocument[]>();
      for (const item of menuItems) {
        const list = itemsByMenu.get(item.menuId) ?? [];
        list.push(item);
        itemsByMenu.set(item.menuId, list);
      }

      const payload = menus
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((menu) => formatMenu(menu, itemsByMenu.get(menu.resourceId) ?? []));

      return { menus: payload };
    },
  );
}

