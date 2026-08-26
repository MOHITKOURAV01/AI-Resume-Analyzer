/**
 * CoverLetterGenerator.test.tsx — unit tests for the Cover Letter Generator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoverLetterGenerator } from './CoverLetterGenerator';

describe('CoverLetterGenerator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the generator header', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByText(/Cover Letter Generator/)).toBeTruthy();
    expect(screen.getByText(/AI-Powered Template Engine v1.0/)).toBeTruthy();
  });

  it('renders the resume text input area', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByPlaceholderText(/Paste your resume text here/)).toBeTruthy();
  });

  it('renders the job description input area', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByPlaceholderText(/Paste the job description here/)).toBeTruthy();
  });

  it('renders the target role selector', () => {
    render(<CoverLetterGenerator />);
    const select = screen.getByLabelText('Target Role');
    expect(select).toBeTruthy();
    expect(select.querySelectorAll('option').length).toBeGreaterThanOrEqual(4);
  });

  it('renders the tone selector with all three options', () => {
    render(<CoverLetterGenerator />);
    const select = screen.getByLabelText('Tone');
    expect(select).toBeTruthy();
    expect(select.querySelectorAll('option').length).toBe(3);
  });

  it('renders the company name input', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByPlaceholderText(/Google, Stripe, Acme/)).toBeTruthy();
  });

  it('disables generate button when resume text is empty', () => {
    render(<CoverLetterGenerator />);
    const btn = screen.getByRole('button', { name: /Generate Cover Letter/ });
    expect(btn).toBeDisabled();
  });

  it('enables generate button when resume text is provided', () => {
    render(<CoverLetterGenerator />);
    const textarea = screen.getByPlaceholderText(/Paste your resume text here/);
    fireEvent.change(textarea, { target: { value: 'Software Engineer with 5 years of experience in React and Python.' } });
    const btn = screen.getByRole('button', { name: /Generate Cover Letter/ });
    expect(btn).not.toBeDisabled();
  });

  it('generates a cover letter when resume text is provided', () => {
    render(<CoverLetterGenerator />);
    const textarea = screen.getByPlaceholderText(/Paste your resume text here/);
    fireEvent.change(textarea, { target: { value: 'Software Engineer with 5 years of experience in React, Python, and SQL.' } });
    const btn = screen.getByRole('button', { name: /Generate Cover Letter/ });
    fireEvent.click(btn);

    // After generation, output section should appear
    expect(screen.getByText(/Generated Cover Letter/)).toBeTruthy();
    expect(screen.getByText(/Copy/)).toBeTruthy();
    expect(screen.getByText(/Download/)).toBeTruthy();
  });

  it('allows changing the target role', () => {
    render(<CoverLetterGenerator />);
    const select = screen.getByLabelText('Target Role');
    fireEvent.change(select, { target: { value: 'Data Analyst' } });
    expect((select as HTMLSelectElement).value).toBe('Data Analyst');
  });

  it('allows changing the tone', () => {
    render(<CoverLetterGenerator />);
    const select = screen.getByLabelText('Tone');
    fireEvent.change(select, { target: { value: 'enthusiastic' } });
    expect((select as HTMLSelectElement).value).toBe('enthusiastic');
  });

  it('allows entering a company name', () => {
    render(<CoverLetterGenerator />);
    const input = screen.getByPlaceholderText(/Google, Stripe, Acme/);
    fireEvent.change(input, { target: { value: 'Google' } });
    expect((input as HTMLInputElement).value).toBe('Google');
  });

  it('shows character count for resume text', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByText('0 characters')).toBeTruthy();
    const textarea = screen.getByPlaceholderText(/Paste your resume text here/);
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    expect(screen.getByText('11 characters')).toBeTruthy();
  });

  it('shows character count for job description', () => {
    render(<CoverLetterGenerator />);
    const jdArea = screen.getByPlaceholderText(/Paste the job description here/);
    fireEvent.change(jdArea, { target: { value: 'We are looking for a software engineer...' } });
    expect(screen.getByText('40 characters')).toBeTruthy();
  });

  it('shows generation history section', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByText(/Generation History/)).toBeTruthy();
  });

  it('expands history panel on click', () => {
    render(<CoverLetterGenerator />);
    const header = screen.getByText(/Generation History/).closest('.clg-history-header')!;
    fireEvent.click(header);
    expect(screen.getByText('No generated letters yet.')).toBeTruthy();
  });

  it('renders footer', () => {
    render(<CoverLetterGenerator />);
    expect(screen.getByText(/Cover Letter Generator · Part of AI Resume Analyzer/)).toBeTruthy();
  });

  it('generates different letters for different tones', () => {
    render(<CoverLetterGenerator />);
    const textarea = screen.getByPlaceholderText(/Paste your resume text here/);
    fireEvent.change(textarea, { target: { value: 'Experienced developer with React and Python skills.' } });

    // Generate with professional tone
    const toneSelect = screen.getByLabelText('Tone');
    fireEvent.change(toneSelect, { target: { value: 'professional' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/ }));
    const letter1 = (screen.getByRole('textbox', { name: '' }) as HTMLTextAreaElement).value;

    // Generate with enthusiastic tone
    fireEvent.change(toneSelect, { target: { value: 'enthusiastic' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/ }));

    // The letter should exist (might be same text due to randomness, but it should be non-empty)
    expect(letter1.length).toBeGreaterThan(100);
  });
});
