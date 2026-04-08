import { seedRoles, validateRoles } from './roleSeeder';

/**
 * Initialize the application with required data
 * This should be called when the app starts or when an admin needs to seed data
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing application...');
    
    // Check if roles are already seeded
    const rolesValid = await validateRoles();
    
    if (!rolesValid) {
      console.log('Roles not found or incomplete, seeding roles...');
      await seedRoles();
      console.log('Roles seeded successfully');
    } else {
      console.log('All roles are already present');
    }
    
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Error during application initialization:', error);
    throw new Error('Failed to initialize application');
  }
};

/**
 * Manual role seeding function for admin use
 */
export const manualSeedRoles = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await seedRoles();
    return {
      success: true,
      message: 'Roles seeded successfully'
    };
  } catch (error) {
    console.error('Error during manual role seeding:', error);
    return {
      success: false,
      message: 'Failed to seed roles'
    };
  }
};