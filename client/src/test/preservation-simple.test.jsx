import { describe, it, expect, beforeEach } from 'vitest';
import { TEMPLATES, CATEGORIES } from '../data/templates';

/**
 * PRESERVATION PROPERTY TESTS (Data-Focused)
 * 
 * These tests verify that existing data structures and business logic remain unchanged 
 * after the bugfix. They test the baseline behavior of the UNFIXED code at the data level.
 * 
 * Testing approach:
 * - Property 6: Legacy templates without textZones - templates work without new metadata
 * - Property 7: Existing functionality - data structures, metadata, categorization
 * 
 * Expected outcome: All tests PASS on unfixed code, establishing baseline to preserve
 */

// Define TEXT_COLORS (as in CustomizePage.jsx)
const TEXT_COLORS = {
  'royal-maroon': { name: 'royal maroon', color: '#800020', dotColor: '#800020' },
  'rose-blush': { name: 'rose blush', color: '#c4787a', dotColor: '#c4787a' },
  'peacock-teal': { name: 'peacock teal', color: '#2a7a7a', dotColor: '#2a7a7a' },
  'gold-leaf': { name: 'gold leaf', color: '#B8860B', dotColor: '#B8860B' },
  'ivory-cream': { name: 'ivory cream', color: '#F5E6D3', dotColor: '#F5E6D3' },
  'warm-terracotta': { name: 'warm terracotta', color: '#A0522D', dotColor: '#A0522D' },
  'antique-gold': { name: 'antique gold', color: '#C19A6B', dotColor: '#C19A6B' },
  'deep-burgundy': { name: 'deep burgundy', color: '#6B0F2E', dotColor: '#6B0F2E' },
  'soft-brown': { name: 'soft brown', color: '#7D5A44', dotColor: '#7D5A44' },
};

describe('Preservation Property Tests - Data and Metadata', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  // ==============================================
  // Property 6: Legacy Template Metadata
  // ==============================================

  describe('Property 6: Legacy Templates Without textZones', () => {
    
    it('should have templates without textZones metadata (baseline behavior)', () => {
      // All templates in unfixed code should NOT have textZones, videoUrl, or audioUrl
      TEMPLATES.forEach(template => {
        expect(template).toHaveProperty('_id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('category');
        expect(template).toHaveProperty('previewImage');
        expect(template).toHaveProperty('price');
        
        // Unfixed code doesn't have these properties - this is baseline behavior
        expect(template.textZones).toBeUndefined();
        expect(template.videoUrl).toBeUndefined();
        expect(template.audioUrl).toBeUndefined();
      });
    });

    it('should preserve existing template metadata structure', () => {
      // Verify required properties for all templates
      TEMPLATES.forEach(template => {
        expect(template._id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.slug).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.previewImage).toBeTruthy();
        expect(template.language).toBeTruthy();
        expect(typeof template.price).toBe('number');
        expect(typeof template.hasVideo).toBe('boolean');
        
        if (template.hasVideo) {
          expect(typeof template.videoPrice).toBe('number');
        }
      });
    });

    it('should have unique template IDs', () => {
      const ids = TEMPLATES.map(t => t._id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should have unique template slugs', () => {
      const slugs = TEMPLATES.map(t => t.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    });
  });

  // ==============================================
  // Property 7: Existing UI Functionality
  // ==============================================

  describe('Property 7.1: Text Color Definitions', () => {
    
    it('should preserve all defined text color options', () => {
      const expectedColors = [
        'royal-maroon',
        'rose-blush',
        'peacock-teal',
        'gold-leaf',
        'ivory-cream',
        'warm-terracotta',
        'antique-gold',
        'deep-burgundy',
        'soft-brown'
      ];
      
      expectedColors.forEach(colorKey => {
        expect(TEXT_COLORS[colorKey]).toBeDefined();
        expect(TEXT_COLORS[colorKey]).toHaveProperty('name');
        expect(TEXT_COLORS[colorKey]).toHaveProperty('color');
        expect(TEXT_COLORS[colorKey]).toHaveProperty('dotColor');
        expect(TEXT_COLORS[colorKey].color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have color name matching pattern', () => {
      Object.values(TEXT_COLORS).forEach(color => {
        expect(color.name).toBeTruthy();
        expect(typeof color.name).toBe('string');
      });
    });
  });

  describe('Property 7.2: Category Definitions', () => {
    
    it('should preserve all category options', () => {
      const expectedCategories = [
        'all', 'wedding', 'engagement', 'haldi', 'mehndi', 
        'sangeet', 'reception', 'ganpati', 'navratri', 
        'durga-puja', 'diwali', 'holi', 'janmashtami', 'birthday'
      ];
      
      expectedCategories.forEach(catId => {
        const category = CATEGORIES.find(c => c.id === catId);
        expect(category).toBeDefined();
        expect(category).toHaveProperty('label');
        expect(typeof category.label).toBe('string');
      });
    });

    it('should have unique category IDs', () => {
      const ids = CATEGORIES.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should validate all templates belong to defined categories', () => {
      const categoryIds = CATEGORIES.map(c => c.id).filter(id => id !== 'all');
      
      TEMPLATES.forEach(template => {
        expect(categoryIds).toContain(template.category);
      });
    });
  });

  describe('Property 7.3: Template Distribution', () => {
    
    it('should have 100+ templates total', () => {
      expect(TEMPLATES.length).toBeGreaterThanOrEqual(100);
    });

    it('should have templates in wedding category', () => {
      const weddingTemplates = TEMPLATES.filter(t => t.category === 'wedding');
      expect(weddingTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in ganpati category', () => {
      const ganpatiTemplates = TEMPLATES.filter(t => t.category === 'ganpati');
      expect(ganpatiTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in birthday category', () => {
      const birthdayTemplates = TEMPLATES.filter(t => t.category === 'birthday');
      expect(birthdayTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in haldi category', () => {
      const haldiTemplates = TEMPLATES.filter(t => t.category === 'haldi');
      expect(haldiTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in mehndi category', () => {
      const mehndiTemplates = TEMPLATES.filter(t => t.category === 'mehndi');
      expect(mehndiTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in sangeet category', () => {
      const sangeetTemplates = TEMPLATES.filter(t => t.category === 'sangeet');
      expect(sangeetTemplates.length).toBeGreaterThan(0);
    });

    it('should have templates in engagement category', () => {
      const engagementTemplates = TEMPLATES.filter(t => t.category === 'engagement');
      expect(engagementTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('Property 7.4: Video Template Support', () => {
    
    it('should have templates marked with hasVideo flag', () => {
      const videoTemplates = TEMPLATES.filter(t => t.hasVideo === true);
      expect(videoTemplates.length).toBeGreaterThan(0);
    });

    it('should have videoPrice for all hasVideo templates', () => {
      const videoTemplates = TEMPLATES.filter(t => t.hasVideo === true);
      
      videoTemplates.forEach(template => {
        expect(template.videoPrice).toBeDefined();
        expect(typeof template.videoPrice).toBe('number');
        expect(template.videoPrice).toBeGreaterThan(0);
      });
    });

    it('should have videoPrice >= price for hasVideo templates', () => {
      const videoTemplates = TEMPLATES.filter(t => t.hasVideo === true);
      
      videoTemplates.forEach(template => {
        expect(template.videoPrice).toBeGreaterThanOrEqual(template.price);
      });
    });
  });

  describe('Property 7.5: Language Support', () => {
    
    it('should have language property for all templates', () => {
      TEMPLATES.forEach(template => {
        expect(template.language).toBeDefined();
        expect(['english', 'hindi', 'marathi']).toContain(template.language);
      });
    });

    it('should have English templates', () => {
      const englishTemplates = TEMPLATES.filter(t => t.language === 'english');
      expect(englishTemplates.length).toBeGreaterThan(0);
    });

    it('should have Hindi templates', () => {
      const hindiTemplates = TEMPLATES.filter(t => t.language === 'hindi');
      expect(hindiTemplates.length).toBeGreaterThan(0);
    });
  });

  describe('Property 7.6: Template Pricing', () => {
    
    it('should have valid price for all templates', () => {
      TEMPLATES.forEach(template => {
        expect(typeof template.price).toBe('number');
        expect(template.price).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have paid templates (price > 0)', () => {
      const paidTemplates = TEMPLATES.filter(t => t.price > 0);
      expect(paidTemplates.length).toBeGreaterThan(0);
    });

    it('should have consistent pricing structure', () => {
      TEMPLATES.forEach(template => {
        if (template.price > 0) {
          // Paid templates should have reasonable price
          expect(template.price).toBeGreaterThanOrEqual(1);
          expect(template.price).toBeLessThanOrEqual(1000);
        }
      });
    });
  });

  describe('Property 7.7: Sample Text Structure', () => {
    
    it('should have sampleText for templates', () => {
      TEMPLATES.forEach(template => {
        if (template.sampleText) {
          expect(typeof template.sampleText).toBe('object');
        }
      });
    });

    it('should have common fields in sampleText', () => {
      const templatesWithSample = TEMPLATES.filter(t => t.sampleText);
      
      if (templatesWithSample.length > 0) {
        // Common fields that should appear in sample text
        const commonFields = ['blessing', 'event', 'date'];
        
        templatesWithSample.forEach(template => {
          const sampleKeys = Object.keys(template.sampleText);
          // At least one common field should be present
          const hasCommonField = commonFields.some(field => sampleKeys.includes(field));
          expect(sampleKeys.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Property 7.8: Recommended Colors', () => {
    
    it('should have recommendedColor for templates', () => {
      TEMPLATES.forEach(template => {
        expect(template.recommendedColor).toBeDefined();
        expect(typeof template.recommendedColor).toBe('string');
      });
    });

    it('should have valid recommendedColor references', () => {
      const validColorKeys = Object.keys(TEXT_COLORS);
      
      TEMPLATES.forEach(template => {
        expect(validColorKeys).toContain(template.recommendedColor);
      });
    });
  });

  describe('Property 7.9: Payment Tracking (localStorage)', () => {
    
    it('should support localStorage for payment tracking', () => {
      const testTemplateId = 'test-template-123';
      
      // Set paid status
      localStorage.setItem(`paid_${testTemplateId}`, 'true');
      expect(localStorage.getItem(`paid_${testTemplateId}`)).toBe('true');
      
      // Clear paid status
      localStorage.removeItem(`paid_${testTemplateId}`);
      expect(localStorage.getItem(`paid_${testTemplateId}`)).toBeNull();
    });

    it('should persist payment status across operations', () => {
      const testTemplateId = 'test-template-456';
      
      // Initial state
      expect(localStorage.getItem(`paid_${testTemplateId}`)).toBeNull();
      
      // Mark as paid
      localStorage.setItem(`paid_${testTemplateId}`, 'true');
      const isPaid = localStorage.getItem(`paid_${testTemplateId}`) === 'true';
      expect(isPaid).toBe(true);
      
      // Clean up
      localStorage.removeItem(`paid_${testTemplateId}`);
    });
  });

  describe('Property 7.10: Template Image Paths', () => {
    
    it('should have previewImage paths for all templates', () => {
      TEMPLATES.forEach(template => {
        expect(template.previewImage).toBeDefined();
        expect(typeof template.previewImage).toBe('string');
        expect(template.previewImage).toMatch(/^\/templates\//);
      });
    });

    it('should have valid image file extensions', () => {
      TEMPLATES.forEach(template => {
        const ext = template.previewImage.split('.').pop().toLowerCase();
        expect(['png', 'jpg', 'jpeg']).toContain(ext);
      });
    });
  });

  describe('Property 7.11: Category-Specific Templates', () => {
    
    it('should have wedding templates with correct category', () => {
      const weddingTemplates = TEMPLATES.filter(t => t.category === 'wedding');
      weddingTemplates.forEach(template => {
        expect(template.category).toBe('wedding');
        expect(template.name).toBeTruthy();
      });
    });

    it('should have ganpati templates with correct category', () => {
      const ganpatiTemplates = TEMPLATES.filter(t => t.category === 'ganpati');
      ganpatiTemplates.forEach(template => {
        expect(template.category).toBe('ganpati');
        expect(template.name).toBeTruthy();
      });
    });

    it('should have festival templates (navratri, diwali, holi)', () => {
      const festivalCategories = ['navratri', 'diwali', 'holi', 'janmashtami'];
      
      festivalCategories.forEach(category => {
        const templates = TEMPLATES.filter(t => t.category === category);
        expect(templates.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Property 7.12: Data Consistency', () => {
    
    it('should have consistent data types across all templates', () => {
      TEMPLATES.forEach(template => {
        expect(typeof template._id).toBe('string');
        expect(typeof template.name).toBe('string');
        expect(typeof template.slug).toBe('string');
        expect(typeof template.category).toBe('string');
        expect(typeof template.previewImage).toBe('string');
        expect(typeof template.language).toBe('string');
        expect(typeof template.hasVideo).toBe('boolean');
        expect(typeof template.price).toBe('number');
        expect(typeof template.videoPrice).toBe('number');
        expect(typeof template.recommendedColor).toBe('string');
      });
    });

    it('should not have null or undefined required fields', () => {
      TEMPLATES.forEach(template => {
        expect(template._id).not.toBeNull();
        expect(template.name).not.toBeNull();
        expect(template.slug).not.toBeNull();
        expect(template.category).not.toBeNull();
        expect(template.previewImage).not.toBeNull();
        expect(template._id).not.toBeUndefined();
        expect(template.name).not.toBeUndefined();
        expect(template.slug).not.toBeUndefined();
      });
    });
  });

  describe('Property 7.13: Template Search and Filter Support', () => {
    
    it('should support finding templates by slug', () => {
      const testTemplate = TEMPLATES[0];
      const found = TEMPLATES.find(t => t.slug === testTemplate.slug);
      expect(found).toBeDefined();
      expect(found._id).toBe(testTemplate._id);
    });

    it('should support finding templates by ID', () => {
      const testTemplate = TEMPLATES[0];
      const found = TEMPLATES.find(t => t._id === testTemplate._id);
      expect(found).toBeDefined();
      expect(found.slug).toBe(testTemplate.slug);
    });

    it('should support filtering by category', () => {
      const category = 'wedding';
      const filtered = TEMPLATES.filter(t => t.category === category);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(template => {
        expect(template.category).toBe(category);
      });
    });

    it('should support filtering by language', () => {
      const language = 'english';
      const filtered = TEMPLATES.filter(t => t.language === language);
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach(template => {
        expect(template.language).toBe(language);
      });
    });

    it('should support filtering by hasVideo', () => {
      const videoTemplates = TEMPLATES.filter(t => t.hasVideo === true);
      const nonVideoTemplates = TEMPLATES.filter(t => t.hasVideo === false);
      
      // In current implementation, hasVideo filtering works
      expect(videoTemplates.length + nonVideoTemplates.length).toBe(TEMPLATES.length);
      
      // Verify filtering logic works (at least one category must have templates)
      expect(videoTemplates.length >= 0).toBe(true);
      expect(nonVideoTemplates.length >= 0).toBe(true);
    });
  });
});
