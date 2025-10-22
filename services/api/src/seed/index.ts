import type { FastifyBaseLogger } from 'fastify';

import { getTenantCollections } from '../db/mongo';
import { menuFixtures } from './menu-fixtures';

const normalizeTenantIds = (tenantIds: string[]): string[] => {
  const unique = new Set(tenantIds.filter(Boolean));
  if (unique.size === 0) {
    unique.add('pizzakebab');
  }
  return Array.from(unique);
};

export const seedTenantData = async (tenantIds: string[], logger: FastifyBaseLogger): Promise<void> => {
  const ids = normalizeTenantIds(tenantIds);

  for (const tenantId of ids) {
    try {
      const collections = await getTenantCollections(tenantId);

      for (const menu of menuFixtures) {
        await collections.menus.updateOne(
          { resourceId: menu.resourceId },
          {
            $setOnInsert: {
              resourceId: menu.resourceId,
              createdAt: new Date(),
            },
            $set: {
              name: menu.name,
              description: menu.description,
              translationKey: menu.translationKey,
              isActive: menu.isActive,
            },
          },
          { upsert: true },
        );

        for (const item of menu.items) {
          await collections.menuItems.updateOne(
            { resourceId: item.resourceId },
            {
              $setOnInsert: {
                resourceId: item.resourceId,
                createdAt: new Date(),
              },
              $set: {
                menuId: menu.resourceId,
                name: item.name,
                description: item.description,
                nameKey: item.nameKey,
                descriptionKey: item.descriptionKey,
                categoryKey: item.categoryKey,
                price: item.price,
                currency: item.currency,
                isAvailable: true,
                imageUrl: item.imageUrl,
                rating: item.rating,
                discountPercentage: item.discountPercentage,
                isPopular: item.isPopular,
                isNew: item.isNew,
              },
            },
            { upsert: true },
          );
        }
      }
    } catch (error) {
      logger.error({ err: error, tenantId }, 'failed to seed tenant data');
    }
  }
};

