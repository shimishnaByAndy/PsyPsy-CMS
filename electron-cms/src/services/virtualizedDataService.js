/**
 * VirtualizedDataService - Parse Server integration for virtual scrolling
 * 
 * Provides efficient data loading, caching, and streaming for large datasets
 * with memory management and performance optimizations.
 */

import Parse from 'parse';

export class VirtualizedDataService {
  constructor(parseClass, pageSize = 100) {
    this.parseClass = parseClass;
    this.pageSize = pageSize;
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get total count of records in the Parse class
   */
  async getTotalCount(filters = {}) {
    try {
      const query = new Parse.Query(this.parseClass);
      
      // Apply filters if provided
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string') {
            query.matches(key, new RegExp(value, 'i'));
          } else {
            query.equalTo(key, value);
          }
        }
      });

      return await query.count();
    } catch (error) {
      console.error('Failed to get total count:', error);
      throw error;
    }
  }

  /**
   * Load a specific page range of data
   */
  async loadPage(startIndex, endIndex, filters = {}, sortField = 'updatedAt', sortDirection = 'desc') {
    const cacheKey = `${startIndex}-${endIndex}-${JSON.stringify(filters)}-${sortField}-${sortDirection}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    try {
      const query = new Parse.Query(this.parseClass);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'string') {
            query.matches(key, new RegExp(value, 'i'));
          } else {
            query.equalTo(key, value);
          }
        }
      });

      // Apply pagination
      query.skip(startIndex);
      query.limit(Math.min(endIndex - startIndex, this.pageSize));
      
      // Apply sorting
      if (sortDirection === 'desc') {
        query.descending(sortField);
      } else {
        query.ascending(sortField);
      }

      // Include related objects if needed
      if (this.parseClass === 'Client') {
        query.include('clientPtr');
      } else if (this.parseClass === 'Professional') {
        query.include('professionalPtr');
      } else if (this.parseClass === 'Appointment') {
        query.include(['clientPtr', 'professionalPtr']);
      }

      const results = await query.find();
      const transformedData = results.map(obj => this.transformObject(obj));

      // Cache results
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
      });

      // Clean up old cache entries
      this.cleanupCache();

      return transformedData;
    } catch (error) {
      console.error('Failed to load page:', error);
      throw error;
    }
  }

  /**
   * Transform Parse object to plain object
   */
  transformObject(parseObj) {
    const transformed = {
      id: parseObj.id,
      ...parseObj.attributes,
      createdAt: parseObj.createdAt,
      updatedAt: parseObj.updatedAt,
    };

    // Handle related objects
    if (parseObj.get('clientPtr')) {
      transformed.clientPtr = {
        id: parseObj.get('clientPtr').id,
        ...parseObj.get('clientPtr').attributes,
      };
    }

    if (parseObj.get('professionalPtr')) {
      transformed.professionalPtr = {
        id: parseObj.get('professionalPtr').id,
        ...parseObj.get('professionalPtr').attributes,
      };
    }

    return transformed;
  }

  /**
   * Stream data in batches for initial loading
   */
  async *streamData(batchSize = 100, filters = {}, sortField = 'updatedAt') {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const query = new Parse.Query(this.parseClass);
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string') {
              query.matches(key, new RegExp(value, 'i'));
            } else {
              query.equalTo(key, value);
            }
          }
        });

        query.skip(skip);
        query.limit(batchSize);
        query.ascending(sortField);
        
        // Include related objects
        if (this.parseClass === 'Client') {
          query.include('clientPtr');
        } else if (this.parseClass === 'Professional') {
          query.include('professionalPtr');
        }

        const results = await query.find();
        
        if (results.length > 0) {
          yield results.map(obj => this.transformObject(obj));
          skip += batchSize;
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Stream error:', error);
        hasMore = false;
        throw error;
      }
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }

    // Prevent cache from growing too large
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      // Keep only the 50 most recent entries
      this.cache.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        this.cache.set(key, value);
      });
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Enhanced streaming service for very large datasets
export class StreamingDataService extends VirtualizedDataService {
  constructor(parseClass, pageSize = 100) {
    super(parseClass, pageSize);
    this.streamCache = new Map();
  }

  /**
   * Advanced streaming with memory management
   */
  async *streamDataAdvanced(batchSize = 100, filters = {}) {
    let cursor = null;
    let hasMore = true;
    let processedCount = 0;

    while (hasMore) {
      try {
        const query = new Parse.Query(this.parseClass);
        
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'string') {
              query.matches(key, new RegExp(value, 'i'));
            } else {
              query.equalTo(key, value);
            }
          }
        });

        if (cursor) {
          query.greaterThan('objectId', cursor);
        }

        query.limit(batchSize);
        query.ascending('objectId');
        
        const results = await query.find();
        
        if (results.length > 0) {
          cursor = results[results.length - 1].id;
          processedCount += results.length;
          
          yield {
            data: results.map(obj => this.transformObject(obj)),
            processedCount,
            hasMore: results.length === batchSize,
          };

          if (results.length < batchSize) {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Advanced stream error:', error);
        hasMore = false;
        throw error;
      }
    }
  }
}

export default VirtualizedDataService;