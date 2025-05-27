/**
 * Professional Service - Handles professional data operations with Parse Server integration
 * Based on ClassStructDocs schema for User and Professional classes
 */

import Parse from 'parse';

// Helper function to create mock professional data for development/testing
const createMockProfessionals = (count = 20) => {
  console.log('Creating mock professional data for development');
  
  const firstNames = [
    'Dr. Sarah', 'Dr. Michael', 'Dr. Emily', 'Dr. David', 'Dr. Jessica', 'Dr. Robert', 'Dr. Amanda', 'Dr. Christopher',
    'Dr. Jennifer', 'Dr. Matthew', 'Dr. Lisa', 'Dr. Andrew', 'Dr. Michelle', 'Dr. Daniel', 'Dr. Rachel',
    'Dr. Kevin', 'Dr. Nicole', 'Dr. Brian', 'Dr. Stephanie', 'Dr. Mark', 'Dr. Laura', 'Dr. Steven', 'Dr. Catherine', 'Dr. James'
  ];
  
  const lastNames = [
    'Anderson', 'Thompson', 'Wilson', 'Martinez', 'Taylor', 'Brown', 'Davis', 'Miller',
    'Garcia', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young',
    'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker'
  ];

  const businessNames = [
    'Wellness Psychology Center', 'Mindful Therapy Practice', 'Healing Hearts Counseling', 'Serenity Mental Health',
    'Balanced Life Psychology', 'Harmony Therapeutic Services', 'Peaceful Mind Clinic', 'Renewal Psychology Group',
    'Clarity Counseling Center', 'Insight Therapy Associates', 'Tranquil Minds Practice', 'Empowerment Psychology',
    'Resilience Counseling Services', 'Mindscape Therapy Center', 'Flourish Mental Health', 'Compass Psychology'
  ];

  const profTypes = [
    { id: 1, name: 'Psychologist' },
    { id: 2, name: 'Social Worker' },
    { id: 3, name: 'Psychoeducator' },
    { id: 4, name: 'Marriage and Family Therapist' },
    { id: 5, name: 'Licensed Professional Counselor' },
    { id: 6, name: 'Clinical Social Worker' }
  ];

  const languages = [
    ['English'], ['French'], ['English', 'French'], ['English', 'Spanish'],
    ['French', 'Spanish'], ['English', 'French', 'Spanish']
  ];

  const cities = [
    'Montreal', 'Toronto', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton',
    'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'
  ];

  const expertises = [
    ['Anxiety', 'Depression'], ['Trauma', 'PTSD'], ['Couples Therapy', 'Relationship Issues'],
    ['Child Psychology', 'Adolescent Therapy'], ['Addiction', 'Substance Abuse'],
    ['Grief Counseling', 'Loss'], ['Stress Management', 'Burnout'], ['Family Therapy', 'Parenting']
  ];

  const meetTypes = [
    { id: 1, name: 'In-person only' },
    { id: 2, name: 'Online only' },
    { id: 3, name: 'Both in-person and online' }
  ];

  return Array.from({ length: count }).map((_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase().replace('dr. ', '')}.${lastName.toLowerCase()}${index + 1}@psypsy.com`;
    const username = `${firstName.toLowerCase().replace('dr. ', '')}${lastName.toLowerCase()}${index + 1}`;
    const businessName = businessNames[Math.floor(Math.random() * businessNames.length)];
    const profType = profTypes[Math.floor(Math.random() * profTypes.length)];
    
    // Generate realistic birth date (25-65 years old for professionals)
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - (25 + Math.floor(Math.random() * 40));
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dob = new Date(birthYear, birthMonth, birthDay);
    
    // Generate phone numbers
    const phoneNb = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    const bussPhoneNb = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    
    // Generate address
    const city = cities[Math.floor(Math.random() * cities.length)];
    const streetNumber = Math.floor(Math.random() * 9999) + 1;
    const streetNames = ['Professional Blvd', 'Medical Center Dr', 'Wellness Ave', 'Therapy Ln', 'Counseling St'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const suiteNumber = Math.floor(Math.random() * 500) + 100;
    
    const addressObj = {
      street: `${streetNumber} ${streetName}`,
      suite: `Suite ${suiteNumber}`,
      city: city,
      province: city === 'Montreal' || city === 'Quebec City' ? 'QC' : 'ON',
      postalCode: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`,
      country: 'Canada'
    };

    const meetType = meetTypes[Math.floor(Math.random() * meetTypes.length)];
    const selectedExpertises = expertises[Math.floor(Math.random() * expertises.length)];
    const offeredLanguages = languages[Math.floor(Math.random() * languages.length)];

    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const updatedAt = new Date(createdAt.getTime() + Math.floor(Math.random() * (now.getTime() - createdAt.getTime())));

    // Generate availability (simplified)
    const availability = [
      { day: 'Monday', slots: ['09:00-12:00', '13:00-17:00'] },
      { day: 'Tuesday', slots: ['09:00-12:00', '13:00-17:00'] },
      { day: 'Wednesday', slots: ['09:00-12:00'] },
      { day: 'Thursday', slots: ['09:00-12:00', '13:00-17:00'] },
      { day: 'Friday', slots: ['09:00-15:00'] }
    ];

    return {
      // User fields
      id: `prof-user-${index + 1}`,
      objectId: `prof-user-${index + 1}`,
      username: username,
      email: email,
      emailVerified: Math.random() > 0.05, // 95% verified for professionals
      userType: 1, // Professional type
      roleNames: ['professional'],
      isBlocked: Math.random() > 0.98, // 2% blocked
      createdAt: createdAt,
      updatedAt: updatedAt,
      
      // Professional pointer data (professionalPtr)
      professionalPtr: {
        objectId: `prof-${index + 1}`,
        firstName: firstName.replace('Dr. ', ''),
        lastName: lastName,
        dob: dob,
        gender: Math.floor(Math.random() * 4) + 1, // 1-4 as per schema
        profType: profType.id,
        profTypeName: profType.name,
        businessName: businessName,
        bussEmail: email,
        phoneNb: { number: phoneNb, canShare: Math.random() > 0.3 },
        bussPhoneNb: bussPhoneNb,
        offeredLangArr: offeredLanguages,
        motherTongue: offeredLanguages.includes('French') ? 2 : 1, // 1=English, 2=French
        meetType: meetType.id,
        meetTypeName: meetType.name,
        addressObj: addressObj,
        expertises: selectedExpertises,
        availability: availability,
        servOfferedArr: [1, 2, 3], // Mock service types
        servedClientele: ['Adults', 'Adolescents'],
        thirdPartyPayers: Math.random() > 0.5 ? ['CNESST', 'SAAQ'] : [],
        eduInstitute: Math.floor(Math.random() * 10) + 1,
        partOfOrder: {
          orderName: `${profType.name} Order of ${city === 'Montreal' ? 'Quebec' : 'Ontario'}`,
          memberNumber: `${profType.id}${String(index + 1).padStart(4, '0')}`,
          isValid: true
        },
        createdAt: createdAt,
        updatedAt: updatedAt
      }
    };
  });
};

/**
 * Professional Service - Operations for professional data management
 */
export const ProfessionalService = {
  /**
   * Get professionals with filtering, pagination, and search
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-based)
   * @param {number} params.limit - Number of items per page
   * @param {string} params.search - Search term for name or email
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDirection - Sort direction ('asc' or 'desc')
   * @param {Object} params.filters - Additional filters (profType, meetType, etc.)
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
      // Get the current user and session token
      const currentUser = Parse.User.current();
      const sessionToken = currentUser ? currentUser.getSessionToken() : null;

      console.log('Current user:', currentUser ? currentUser.id : 'None');
      console.log('Session token:', sessionToken ? `${sessionToken.substring(0, 5)}...` : 'None');

      if (!currentUser || !sessionToken) {
        console.warn('No authenticated user found - using mock data');
        const mockProfessionals = createMockProfessionals(limit * 5); // Create more for pagination
        const startIndex = page * limit;
        const endIndex = startIndex + limit;
        
        let filteredProfessionals = mockProfessionals;
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.firstName.toLowerCase().includes(searchLower) ||
            prof.professionalPtr.lastName.toLowerCase().includes(searchLower) ||
            prof.email.toLowerCase().includes(searchLower) ||
            prof.professionalPtr.businessName.toLowerCase().includes(searchLower) ||
            prof.professionalPtr.profTypeName.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply additional filters
        if (filters.profType && filters.profType !== 'all') {
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.profType === parseInt(filters.profType)
          );
        }

        if (filters.meetType && filters.meetType !== 'all') {
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.meetType === parseInt(filters.meetType)
          );
        }

        if (filters.gender && filters.gender !== 'all') {
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.gender === parseInt(filters.gender)
          );
        }
        
        if (filters.language && filters.language !== 'all') {
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.offeredLangArr.includes(filters.language)
          );
        }

        if (filters.expertise && filters.expertise !== 'all') {
          filteredProfessionals = filteredProfessionals.filter(prof => 
            prof.professionalPtr.expertises.some(exp => 
              exp.toLowerCase().includes(filters.expertise.toLowerCase())
            )
          );
        }
        
        // Apply sorting
        filteredProfessionals.sort((a, b) => {
          let aValue, bValue;
          
          switch (sortBy) {
            case 'name':
              aValue = `${a.professionalPtr.firstName} ${a.professionalPtr.lastName}`;
              bValue = `${b.professionalPtr.firstName} ${b.professionalPtr.lastName}`;
              break;
            case 'businessName':
              aValue = a.professionalPtr.businessName;
              bValue = b.professionalPtr.businessName;
              break;
            case 'profType':
              aValue = a.professionalPtr.profTypeName;
              bValue = b.professionalPtr.profTypeName;
              break;
            case 'email':
              aValue = a.email;
              bValue = b.email;
              break;
            case 'createdAt':
            case 'updatedAt':
              aValue = new Date(a[sortBy]);
              bValue = new Date(b[sortBy]);
              break;
            default:
              aValue = a[sortBy] || '';
              bValue = b[sortBy] || '';
          }
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortDirection === 'desc') {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          }
        });
        
        const paginatedResults = filteredProfessionals.slice(startIndex, endIndex);
        
        return {
          results: paginatedResults,
          total: filteredProfessionals.length,
          page: page,
          limit: limit,
          totalPages: Math.ceil(filteredProfessionals.length / limit),
          hasNextPage: endIndex < filteredProfessionals.length,
          hasPrevPage: page > 0
        };
      }

      // Real Parse Server implementation would go here
      // For now, fall back to mock data
      console.log('Parse Server implementation not yet available, using mock data');
      return await ProfessionalService.getProfessionals({ page, limit, search, sortBy, sortDirection, filters });

    } catch (error) {
      console.error('Error in ProfessionalService.getProfessionals:', error);
      
      // Fallback to mock data on error
      console.log('Falling back to mock data due to error');
      const mockProfessionals = createMockProfessionals(limit * 3);
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = mockProfessionals.slice(startIndex, endIndex);
      
      return {
        results: paginatedResults,
        total: mockProfessionals.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(mockProfessionals.length / limit),
        hasNextPage: endIndex < mockProfessionals.length,
        hasPrevPage: page > 0,
        error: error.message
      };
    }
  },

  /**
   * Get a single professional by ID
   * @param {string} professionalId - The professional's ID
   * @returns {Promise<Object>} Professional data
   */
  getProfessionalById: async (professionalId) => {
    console.log('ProfessionalService.getProfessionalById called with ID:', professionalId);
    
    try {
      // For now, return mock data
      const mockProfessionals = createMockProfessionals(1);
      return mockProfessionals[0];
    } catch (error) {
      console.error('Error in ProfessionalService.getProfessionalById:', error);
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