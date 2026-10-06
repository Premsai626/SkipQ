import { getStoreRepository } from '../repositories/storeRepository.js';
import { createStoreItemSchema, updateStoreItemSchema } from '../validators/index.js';

export class StoreController {
  /**
   * List all store items.
   * Shared catalog visible to both students and staff.
   */
  static async getItems(req, res, next) {
    try {
      const { category, search, availableOnly } = req.query;
      const isStudent = req.user?.role === 'student';

      const storeRepo = getStoreRepository();
      const items = await storeRepo.findAll({
        category,
        search,
        // Students only see items marked available; staff can see all
        availableOnly: isStudent ? true : availableOnly === 'true',
      });

      return res.json({
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single store item by ID.
   */
  static async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const storeRepo = getStoreRepository();
      const item = await storeRepo.findById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Store item '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
      }

      return res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Create a new Store Item.
   * Restricted strictly to Staff.
   */
  static async createItem(req, res, next) {
    try {
      const data = createStoreItemSchema.parse(req.body);
      const storeRepo = getStoreRepository();

      const newItem = await storeRepo.create({
        ...data,
        createdBy: req.user?.id,
      });

      return res.status(201).json({
        success: true,
        data: newItem,
        message: `Store item '${newItem.name}' added successfully to catalog`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update an existing Store Item.
   * Restricted strictly to Staff.
   */
  static async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const data = updateStoreItemSchema.parse(req.body);
      const storeRepo = getStoreRepository();

      const existing = await storeRepo.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Store item '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
      }

      const updated = await storeRepo.update(id, data);

      return res.json({
        success: true,
        data: updated,
        message: `Store item '${updated.name}' updated successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete a Store Item.
   * Restricted strictly to Staff.
   */
  static async deleteItem(req, res, next) {
    try {
      const { id } = req.params;
      const storeRepo = getStoreRepository();

      const existing = await storeRepo.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Store item '${id}' not found`,
          timestamp: new Date().toISOString(),
        });
      }

      await storeRepo.delete(id);

      return res.json({
        success: true,
        message: `Store item '${existing.name}' deleted successfully`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      next(err);
    }
  }
}
