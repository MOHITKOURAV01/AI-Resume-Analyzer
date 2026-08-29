// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkillGapMatrix } from './SkillGapMatrix';
import type { ClassifiedSkill } from '../utils/jdSkillParser';

describe('SkillGapMatrix Component', () => {
  const mockSkills: ClassifiedSkill[] = [
    { name: 'React', priority: 'REQUIRED', contextPhrase: 'React is required' },
    { name: 'Python', priority: 'REQUIRED', contextPhrase: 'Python is a must-have' },
    { name: 'Docker', priority: 'PREFERRED', contextPhrase: 'Docker is preferred' },
    { name: 'Git', priority: 'STANDARD', contextPhrase: 'Target career track requirement' },
  ];

  it('renders priority matrix headers, badges, and filters skills correctly', () => {
    const candidateSkills = ['React', 'Git'];
    render(<SkillGapMatrix extractedSkills={mockSkills} candidateSkills={candidateSkills} />);

    expect(screen.getByText('Skill Gap Priority Matrix')).toBeInTheDocument();
    // Missing required: Python is missing, so missing count is 1
    expect(screen.getByText(/Missing 1 Critical Requirements/i)).toBeInTheDocument();

    // Check tabs
    expect(screen.getByRole('button', { name: 'All Skills' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'required' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'preferred' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'standard' })).toBeInTheDocument();

    // React should be match
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getAllByText('required').length).toBe(3); // One is button, two are badges
    expect(screen.getAllByText('✓ Match').length).toBe(2);

    // Python should be missing
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getAllByText('✕ Missing').length).toBe(2);
  });

  it('filters list items when category tabs are clicked', () => {
    const candidateSkills = ['React'];
    render(<SkillGapMatrix extractedSkills={mockSkills} candidateSkills={candidateSkills} />);

    // Click preferred tab
    fireEvent.click(screen.getByRole('button', { name: 'preferred' }));

    // Docker should be visible
    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getAllByText('preferred').length).toBe(2); // One is button, one is badge

    // React (required) should NOT be visible
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });
});
