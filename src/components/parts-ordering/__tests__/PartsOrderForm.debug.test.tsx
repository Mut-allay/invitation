describe('PartsOrderForm Import Debug', () => {
  it('should import component without errors', async () => {
    console.log('🔍 Testing import...');
    
    try {
      const module = await import('../PartsOrderForm');
      console.log('✅ Import successful:', Object.keys(module));
      expect(module.PartsOrderForm).toBeDefined();
      
      // Test if we can create an instance
      const React = await import('react');
      const element = React.createElement(module.PartsOrderForm, {
        isOpen: true,
        onClose: () => {},
        tenantId: 'test'
      });
      console.log('✅ Element created:', element);
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  });
});
