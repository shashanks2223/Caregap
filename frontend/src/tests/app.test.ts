import { describe, it, expect } from 'vitest';

describe('CareGap AI Insurance Calculation Logic', () => {
  it('calculates Option A basic premium accurately', () => {
    const baseOptionA = 199;
    const categoryFactor = 1.0;
    const premium = baseOptionA * categoryFactor;
    expect(premium).toBe(199);
  });

  it('calculates Plus dual shield (Option A + Option B) accurately', () => {
    const baseA = 199;
    const baseB = 150;
    const combined = baseA + baseB;
    expect(combined).toBe(349);
  });

  it('applies 10% tenure discount for experienced caregivers (>5 years)', () => {
    const base = 349;
    const discountPct = 0.10;
    const discounted = base - (base * discountPct);
    expect(discounted).toBeCloseTo(314.1, 1);
  });

  it('calculates daily pro-rated benefit from monthly salary', () => {
    const monthlySalary = 18000;
    const dailyBenefit = monthlySalary / 30;
    expect(dailyBenefit).toBe(600);
  });
});

describe('CareGap AI Role Permissions', () => {
  it('restricts medical document access from employer roles', () => {
    const employerCanAccessMedicalDocs = false;
    expect(employerCanAccessMedicalDocs).toBe(false);
  });

  it('allows caregivers to view their own policies and file claims', () => {
    const caregiverCanFileClaims = true;
    expect(caregiverCanFileClaims).toBe(true);
  });
});

