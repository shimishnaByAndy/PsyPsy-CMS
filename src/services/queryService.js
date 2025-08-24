/**
 * Parse Server query adapter for TanStack Query
 * Handles transformation between Parse objects and cacheable plain objects
 * Provides query functions that work with TanStack Query
 */

import Parse from 'parse';
import { ParseAuth } from './parseService';

/**
 * Transform Parse Object to cacheable plain object
 * Parse objects contain circular references and are not JSON serializable
 * @param {Parse.Object|null} parseObj - Parse object to transform
 * @returns {Object|null} Plain object suitable for caching
 */
export const transformParseObject = (parseObj) => {
  if (!parseObj) return null;
  
  // Handle arrays of Parse objects
  if (Array.isArray(parseObj)) {
    return parseObj.map(obj => transformParseObject(obj));
  }
  
  // Handle non-Parse objects (already plain objects)
  if (!(parseObj instanceof Parse.Object)) {
    return parseObj;
  }
  
  const plainObj = {
    id: parseObj.id,
    objectId: parseObj.id,
    className: parseObj.className,
    createdAt: parseObj.get('createdAt'),
    updatedAt: parseObj.get('updatedAt'),
  };
  
  // Copy all attributes, handling nested Parse objects
  const attributes = parseObj.attributes || {};
  Object.keys(attributes).forEach(key => {
    const value = parseObj.get(key);
    
    if (value instanceof Parse.Object) {
      // Recursively transform nested Parse objects
      plainObj[key] = transformParseObject(value);
    } else if (Array.isArray(value)) {
      // Handle arrays that might contain Parse objects
      plainObj[key] = value.map(item => 
        item instanceof Parse.Object ? transformParseObject(item) : item
      );
    } else if (value instanceof Parse.GeoPoint) {
      // Handle Parse GeoPoint
      plainObj[key] = {
        latitude: value.latitude,
        longitude: value.longitude,
        __type: 'GeoPoint'
      };
    } else if (value instanceof Parse.File) {
      // Handle Parse File
      plainObj[key] = {
        name: value.name(),
        url: value.url(),
        __type: 'File'
      };
    } else {
      // Plain value
      plainObj[key] = value;
    }
  });
  
  return plainObj;
};

/**
 * Validate current user session
 * @throws {Error} If no authenticated user or session token
 * @returns {Parse.User} Current authenticated user
 */
export const validateSession = () => {
  const currentUser = ParseAuth.getCurrentUser();
  const sessionToken = currentUser ? currentUser.getSessionToken() : null;
  
  if (!currentUser || !sessionToken) {
    const error = new Error('Authentication required');
    error.code = 101; // Parse error code for invalid session
    throw error;
  }
  
  return currentUser;
};

/**
 * Generic Parse Server query executor for TanStack Query
 * @param {Object} params - Query parameters
 * @param {string} params.className - Parse class name
 * @param {Object} params.conditions - Query conditions
 * @param {Array<string>} params.include - Fields to include (populate)
 * @param {number} params.limit - Maximum results to return
 * @param {number} params.skip - Number of results to skip
 * @param {string} params.sortBy - Field to sort by
 * @param {boolean} params.ascending - Sort direction
 * @param {boolean} params.useMasterKey - Use master key for query
 * @returns {Promise<Array>} Array of transformed plain objects
 */
export const executeParseQuery = async ({
  className,
  conditions = {},
  include = [],
  limit = 100,
  skip = 0,
  sortBy = 'createdAt',
  ascending = false,
  useMasterKey = false
}) => {
  console.log(`Executing Parse query for ${className}:`, { conditions, limit, skip, sortBy });
  
  // Validate session unless using master key
  if (!useMasterKey) {
    validateSession();
  }
  
  const ParseClass = Parse.Object.extend(className);
  const query = new Parse.Query(ParseClass);
  
  // Apply conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Handle complex query conditions
      if (value.$regex) {
        // Regex search
        query.matches(key, new RegExp(value.$regex, value.$options || 'i'));
      } else if (value.$in) {
        // In array
        query.containedIn(key, value.$in);
      } else if (value.$lt) {
        query.lessThan(key, value.$lt);
      } else if (value.$gt) {
        query.greaterThan(key, value.$gt);
      } else if (value.$lte) {
        query.lessThanOrEqualTo(key, value.$lte);
      } else if (value.$gte) {
        query.greaterThanOrEqualTo(key, value.$gte);
      } else if (value.$ne) {
        query.notEqualTo(key, value.$ne);
      } else {
        query.equalTo(key, value);
      }
    } else {
      query.equalTo(key, value);
    }
  });
  
  // Apply includes
  include.forEach(field => query.include(field));
  
  // Apply pagination
  if (limit > 0) query.limit(limit);
  if (skip > 0) query.skip(skip);
  
  // Apply sorting
  if (sortBy) {
    if (ascending) {
      query.ascending(sortBy);
    } else {
      query.descending(sortBy);
    }
  }
  
  try {
    const options = useMasterKey ? { useMasterKey: true } : {};
    const results = await query.find(options);
    const transformed = results.map(transformParseObject);
    
    console.log(`Query successful: ${results.length} results`);
    return transformed;
  } catch (error) {
    console.error(`Error executing query for ${className}:`, error);
    
    // Enhance error with more context
    const enhancedError = new Error(`Parse query failed: ${error.message}`);
    enhancedError.code = error.code;
    enhancedError.originalError = error;
    enhancedError.queryParams = { className, conditions, limit, skip };
    
    throw enhancedError;
  }
};

/**
 * Get count of objects matching conditions
 * @param {Object} params - Query parameters
 * @param {string} params.className - Parse class name
 * @param {Object} params.conditions - Query conditions
 * @param {boolean} params.useMasterKey - Use master key
 * @returns {Promise<number>} Count of matching objects
 */
export const executeParseCount = async ({
  className,
  conditions = {},
  useMasterKey = false
}) => {
  console.log(`Executing Parse count for ${className}:`, conditions);
  
  if (!useMasterKey) {
    validateSession();
  }
  
  const ParseClass = Parse.Object.extend(className);
  const query = new Parse.Query(ParseClass);
  
  // Apply conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && value.$regex) {
      query.matches(key, new RegExp(value.$regex, value.$options || 'i'));
    } else {
      query.equalTo(key, value);
    }
  });
  
  try {
    const options = useMasterKey ? { useMasterKey: true } : {};
    const count = await query.count(options);
    console.log(`Count successful: ${count} objects`);
    return count;
  } catch (error) {
    console.error(`Error counting ${className}:`, error);
    throw error;
  }
};

/**
 * Execute Parse mutation (create, update, delete)
 * @param {Object} params - Mutation parameters
 * @param {string} params.type - Mutation type ('create', 'update', 'delete')
 * @param {string} params.className - Parse class name
 * @param {string} params.objectId - Object ID (for update/delete)
 * @param {Object} params.data - Data to save (for create/update)
 * @param {boolean} params.useMasterKey - Use master key
 * @returns {Promise<Object>} Transformed result object
 */
export const executeParseMutation = async ({
  type,
  className,
  objectId = null,
  data = {},
  useMasterKey = false
}) => {
  console.log(`Executing Parse ${type} mutation for ${className}:`, { objectId, data });
  
  if (!useMasterKey) {
    validateSession();
  }
  
  const options = useMasterKey ? { useMasterKey: true } : {};
  
  try {
    let result;
    
    switch (type) {
      case 'create': {
        const ParseClass = Parse.Object.extend(className);
        const object = new ParseClass();
        
        Object.keys(data).forEach(key => {
          object.set(key, data[key]);
        });
        
        result = await object.save(null, options);
        break;
      }
      
      case 'update': {
        if (!objectId) throw new Error('Object ID required for update');
        
        const ParseClass = Parse.Object.extend(className);
        const query = new Parse.Query(ParseClass);
        const object = await query.get(objectId, options);
        
        Object.keys(data).forEach(key => {
          object.set(key, data[key]);
        });
        
        result = await object.save(null, options);
        break;
      }
      
      case 'delete': {
        if (!objectId) throw new Error('Object ID required for delete');
        
        const ParseClass = Parse.Object.extend(className);
        const query = new Parse.Query(ParseClass);
        const object = await query.get(objectId, options);
        
        await object.destroy(options);
        result = { id: objectId, deleted: true };
        break;
      }
      
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }
    
    console.log(`${type} mutation successful`);
    return type === 'delete' ? result : transformParseObject(result);
  } catch (error) {
    console.error(`Error in ${type} mutation for ${className}:`, error);
    
    const enhancedError = new Error(`Parse ${type} failed: ${error.message}`);
    enhancedError.code = error.code;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

/**
 * Execute Parse Cloud Function
 * @param {string} functionName - Cloud function name
 * @param {Object} params - Function parameters
 * @param {boolean} useMasterKey - Use master key
 * @returns {Promise<any>} Cloud function result
 */
export const executeCloudFunction = async (functionName, params = {}, useMasterKey = false) => {
  console.log(`Executing Cloud Function ${functionName}:`, params);
  
  if (!useMasterKey) {
    validateSession();
  }
  
  try {
    const options = useMasterKey ? { useMasterKey: true } : {};
    const result = await Parse.Cloud.run(functionName, params, options);
    
    console.log(`Cloud Function ${functionName} successful`);
    
    // Transform result if it's a Parse object
    return transformParseObject(result);
  } catch (error) {
    console.error(`Error executing Cloud Function ${functionName}:`, error);
    
    const enhancedError = new Error(`Cloud Function failed: ${error.message}`);
    enhancedError.code = error.code;
    enhancedError.originalError = error;
    
    throw enhancedError;
  }
};

/**
 * Query helper specifically for User class
 * Handles the special case of querying Parse User objects
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} Array of transformed user objects
 */
export const executeUserQuery = async ({
  conditions = {},
  include = [],
  limit = 100,
  skip = 0,
  sortBy = 'createdAt',
  ascending = false,
  useMasterKey = true // User queries typically need master key
}) => {
  console.log('Executing User query:', { conditions, limit, skip });
  
  const query = new Parse.Query(Parse.User);
  
  // Apply conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (value.$or) {
        // Handle OR queries for search
        const orQueries = value.$or.map(condition => {
          const orQuery = new Parse.Query(Parse.User);
          Object.entries(condition).forEach(([orKey, orValue]) => {
            if (orValue.$regex) {
              orQuery.matches(orKey, new RegExp(orValue.$regex, orValue.$options || 'i'));
            } else {
              orQuery.equalTo(orKey, orValue);
            }
          });
          return orQuery;
        });
        return Parse.Query.or(...orQueries);
      } else if (value.$regex) {
        query.matches(key, new RegExp(value.$regex, value.$options || 'i'));
      } else {
        query.equalTo(key, value);
      }
    } else {
      query.equalTo(key, value);
    }
  });
  
  // Apply includes
  include.forEach(field => query.include(field));
  
  // Apply pagination
  if (limit > 0) query.limit(limit);
  if (skip > 0) query.skip(skip);
  
  // Apply sorting
  if (sortBy) {
    if (ascending) {
      query.ascending(sortBy);
    } else {
      query.descending(sortBy);
    }
  }
  
  try {
    const options = useMasterKey ? { useMasterKey: true } : {};
    const results = await query.find(options);
    const transformed = results.map(transformParseObject);
    
    console.log(`User query successful: ${results.length} results`);
    return transformed;
  } catch (error) {
    console.error('Error executing user query:', error);
    throw error;
  }
};