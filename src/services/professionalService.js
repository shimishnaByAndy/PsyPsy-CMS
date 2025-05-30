/**
 * Professional Service - Handles professional data operations with Parse Server integration
 * Based on ClassStructDocs schema for User and Professional classes
 */

import Parse from 'parse';

/**
 * Professional Service - Operations for professional data management
 */
export const ProfessionalService = {
  /**
   * Get professionals with filtering, pagination, and search
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.limit - Number of items per page
   * @param {string} params.search - Search term for name or business
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDirection - Sort direction ('asc' or 'desc')
   * @param {Object} params.filters - Additional filters
   * @returns {Promise<Object>} Object with results, total count, and pagination info
   */
  getProfessionals: async ({
    page = 0,
    limit = 10,
    search = '',
    sortBy = 'createdAt',
    sortDirection = 'desc',
    filters = {}
  } = {}) => {
    console.log('ProfessionalService.getProfessionals called with params:', {
      page, limit, search, sortBy, sortDirection, filters
    });

    try {
      // Check for authenticated session
      const currentUser = Parse.User.current();
      const sessionToken = currentUser ? currentUser.getSessionToken() : null;

      console.log('Current user:', currentUser ? currentUser.id : 'None');
      console.log('Session token:', sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None');

      if (!currentUser || !sessionToken) {
        throw new Error('No authenticated user found - authentication required for professionals');
      }

      // Create query for users with userType = 3 (professionals)
      let userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('userType', 3);
      
      // Include the professional pointer data
      userQuery.include('professionalPtr');
      
      // Apply search if provided
      if (search && search.trim() !== '') {
        const searchQueries = [];
        
        // Search in user fields
        const usernameQuery = new Parse.Query(Parse.User);
        usernameQuery.equalTo('userType', 3);
        usernameQuery.contains('username', search);
        searchQueries.push(usernameQuery);
        
        const emailQuery = new Parse.Query(Parse.User);
        emailQuery.equalTo('userType', 3);
        emailQuery.contains('email', search);
        searchQueries.push(emailQuery);
        
        // Search in professional fields
        const firstNameQuery = new Parse.Query('Professional');
        firstNameQuery.contains('firstName', search);
        const lastNameQuery = new Parse.Query('Professional');
        lastNameQuery.contains('lastName', search);
        const businessNameQuery = new Parse.Query('Professional');
        businessNameQuery.contains('businessName', search);
        
        const professionalSearchQuery = Parse.Query.or(firstNameQuery, lastNameQuery, businessNameQuery);
        const userWithProfessionalQuery = new Parse.Query(Parse.User);
        userWithProfessionalQuery.equalTo('userType', 3);
        userWithProfessionalQuery.matchesQuery('professionalPtr', professionalSearchQuery);
        searchQueries.push(userWithProfessionalQuery);
        
        userQuery = Parse.Query.or(...searchQueries);
        userQuery.include('professionalPtr');
      }
      
      // Apply additional filters through professional pointer
      if (filters.profType && filters.profType !== 'all') {
        const profTypeQuery = new Parse.Query('Professional');
        profTypeQuery.equalTo('profType', parseInt(filters.profType));
        userQuery.matchesQuery('professionalPtr', profTypeQuery);
      }
      
      if (filters.gender && filters.gender !== 'all') {
        const genderQuery = new Parse.Query('Professional');
        genderQuery.equalTo('gender', parseInt(filters.gender));
        userQuery.matchesQuery('professionalPtr', genderQuery);
      }
      
      if (filters.meetType && filters.meetType !== 'all') {
        const meetTypeQuery = new Parse.Query('Professional');
        meetTypeQuery.equalTo('meetType', parseInt(filters.meetType));
        userQuery.matchesQuery('professionalPtr', meetTypeQuery);
      }

      // Apply sorting
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'email') {
        if (sortDirection === 'desc') {
          userQuery.descending(sortBy);
        } else {
          userQuery.ascending(sortBy);
        }
      }
      
      // Apply pagination
      userQuery.skip(page * limit);
      userQuery.limit(limit);
      
      // Get total count
      const totalCount = await userQuery.count();
      
      // Fetch the results
      const users = await userQuery.find();
      
      console.log(`Found ${users.length} professionals from Parse Server`);
      
      // Transform Parse objects to frontend-friendly format
      const transformedResults = users.map(user => {
        const professionalPtr = user.get('professionalPtr');
        
        return {
          id: user.id,
          objectId: user.id,
          username: user.get('username'),
          email: user.get('email'),
          emailVerified: user.get('emailVerified'),
          userType: user.get('userType'),
          roleNames: user.get('roleNames') || ['professional'],
          isBlocked: user.get('isBlocked') || false,
          createdAt: user.get('createdAt'),
          updatedAt: user.get('updatedAt'),
          professionalPtr: professionalPtr ? {
            objectId: professionalPtr.id,
            firstName: professionalPtr.get('firstName'),
            lastName: professionalPtr.get('lastName'),
            businessName: professionalPtr.get('businessName'),
            profType: professionalPtr.get('profType'),
            profTypeName: ProfessionalService.getProfTypeName(professionalPtr.get('profType')),
            dob: professionalPtr.get('dob'),
            gender: professionalPtr.get('gender'),
            genderName: ProfessionalService.getGenderName(professionalPtr.get('gender')),
            phoneNb: professionalPtr.get('phoneNb'),
            meetType: professionalPtr.get('meetType'),
            meetTypeName: ProfessionalService.getMeetTypeName(professionalPtr.get('meetType')),
            spokenLangArr: professionalPtr.get('spokenLangArr') || [],
            expertisesIndArr: professionalPtr.get('expertisesIndArr') || [],
            geoPt: professionalPtr.get('geoPt'),
            addressObj: professionalPtr.get('addressObj'),
            servicesOffered: professionalPtr.get('servicesOffered') || [],
            certifications: professionalPtr.get('certifications') || [],
            experience: professionalPtr.get('experience'),
            isVerified: professionalPtr.get('isVerified') || false,
            rating: professionalPtr.get('rating'),
            reviewCount: professionalPtr.get('reviewCount') || 0,
            createdAt: professionalPtr.get('createdAt'),
            updatedAt: professionalPtr.get('updatedAt')
          } : null
        };
      });
      
      return {
        results: transformedResults,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: (page + 1) * limit < totalCount,
        hasPrevPage: page > 0
      };
      
    } catch (error) {
      console.error('Error in ProfessionalService.getProfessionals:', error);
      throw error;
    }
  },

  /**
   * Get a single professional by ID
   * @param {string} professionalId - Professional user ID
   * @returns {Promise<Object>} Professional object with full details
   */
  getProfessionalById: async (professionalId) => {
    console.log('ProfessionalService.getProfessionalById called with ID:', professionalId);
    
    try {
      // Check for authenticated session
      const currentUser = Parse.User.current();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const userQuery = new Parse.Query(Parse.User);
      userQuery.equalTo('objectId', professionalId);
      userQuery.include('professionalPtr');
      
      const user = await userQuery.first();
      
      if (!user) {
        throw new Error(`Professional with ID ${professionalId} not found`);
      }
      
      const professionalPtr = user.get('professionalPtr');
      
      return {
        id: user.id,
        objectId: user.id,
        username: user.get('username'),
        email: user.get('email'),
        emailVerified: user.get('emailVerified'),
        userType: user.get('userType'),
        roleNames: user.get('roleNames') || ['professional'],
        isBlocked: user.get('isBlocked') || false,
        createdAt: user.get('createdAt'),
        updatedAt: user.get('updatedAt'),
        professionalPtr: professionalPtr ? {
          objectId: professionalPtr.id,
          firstName: professionalPtr.get('firstName'),
          lastName: professionalPtr.get('lastName'),
          businessName: professionalPtr.get('businessName'),
          profType: professionalPtr.get('profType'),
          profTypeName: ProfessionalService.getProfTypeName(professionalPtr.get('profType')),
          dob: professionalPtr.get('dob'),
          gender: professionalPtr.get('gender'),
          genderName: ProfessionalService.getGenderName(professionalPtr.get('gender')),
          phoneNb: professionalPtr.get('phoneNb'),
          meetType: professionalPtr.get('meetType'),
          meetTypeName: ProfessionalService.getMeetTypeName(professionalPtr.get('meetType')),
          spokenLangArr: professionalPtr.get('spokenLangArr') || [],
          expertisesIndArr: professionalPtr.get('expertisesIndArr') || [],
          geoPt: professionalPtr.get('geoPt'),
          addressObj: professionalPtr.get('addressObj'),
          servicesOffered: professionalPtr.get('servicesOffered') || [],
          certifications: professionalPtr.get('certifications') || [],
          experience: professionalPtr.get('experience'),
          isVerified: professionalPtr.get('isVerified') || false,
          rating: professionalPtr.get('rating'),
          reviewCount: professionalPtr.get('reviewCount') || 0,
          createdAt: professionalPtr.get('createdAt'),
          updatedAt: professionalPtr.get('updatedAt')
        } : null
      };
      
    } catch (error) {
      console.error(`Error fetching professional ${professionalId}:`, error);
      throw error;
    }
  },

  /**
   * Helper function to format phone numbers
   * @param {string} phoneNumber - Raw phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber: (phoneNumber) => {
    if (!phoneNumber) return '';
    
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for North American numbers
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const number = cleaned.substring(1);
      return `(${number.substring(0, 3)}) ${number.substring(3, 6)}-${number.substring(6)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    return phoneNumber;
  },

  /**
   * Helper function to calculate age from date of birth
   * @param {Date} dob - Date of birth
   * @returns {number} Age in years
   */
  calculateAge: (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Helper function to get gender display name
   * @param {number} genderCode - Gender code (1-4)
   * @returns {string} Gender display name
   */
  getGenderName: (genderCode) => {
    const genderMap = {
      1: 'Woman',
      2: 'Man', 
      3: 'Other',
      4: 'Not disclosed'
    };
    return genderMap[genderCode] || 'Unknown';
  },

  /**
   * Helper function to get professional type name
   * @param {number} profTypeCode - Professional type code
   * @returns {string} Professional type name
   */
  getProfTypeName: (profTypeCode) => {
    const profTypeMap = {
      1: 'Psychologist',
      2: 'Social Worker',
      3: 'Psychoeducator',
      4: 'Marriage and Family Therapist',
      5: 'Licensed Professional Counselor',
      6: 'Clinical Social Worker'
    };
    return profTypeMap[profTypeCode] || 'Unknown';
  },

  /**
   * Helper function to get meet type name
   * @param {number} meetTypeCode - Meet type code
   * @returns {string} Meet type name
   */
  getMeetTypeName: (meetTypeCode) => {
    const meetTypeMap = {
      1: 'In-person only',
      2: 'Online only',
      3: 'Both in-person and online'
    };
    return meetTypeMap[meetTypeCode] || 'Unknown';
  }
};

export default ProfessionalService; 