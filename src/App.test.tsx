import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.mock('./services/memories', () => ({ memoriesApiConfigured: () => false, fetchMemories: vi.fn() }));
import App from './App';
import { birthday } from './config/birthday';

afterEach(() => { cleanup(); sessionStorage.clear(); localStorage.clear(); });

describe('Birthday OS', () => {
  it('keeps boot controls separate and Skip intro enters the desktop', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    expect(screen.getByText('Birthday OS v14.11')).toBeInTheDocument();
    expect(document.querySelector('.boot-footer .progress-row')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Skip intro' }));
    expect(screen.getByRole('heading', { name: /Nguyễn Thị Thuỳ Trang/ })).toBeInTheDocument();
    expect(screen.getByText('v14.11')).toBeInTheDocument();
  });

  it('shows the recipient and opens/closes the note by keyboard', async () => {
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Nguyễn Thị Thuỳ Trang/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Open Secret_Note.md/ }));
    expect(screen.getByRole('button', { name: 'Mở thư' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mở thư' }));
    await waitFor(() => expect(screen.getByRole('heading', { name: birthday.noteTitle })).toBeInTheDocument(), { timeout: 1000 });
    expect(screen.getByRole('dialog')).toHaveTextContent(birthday.noteParagraphs[0]);
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens the photo lightbox from Memory Film and changes the selected photo with keyboard arrows', async () => {
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Gallery' })[0]);
    fireEvent.click(await screen.findByRole('tab', { name: 'Memory Film' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open photo' }));
    await screen.findByRole('dialog', { name: 'Lightbox' });
    expect(screen.getByRole('group', { name: '1 of 6' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('group', { name: '2 of 6' })).toBeInTheDocument());
  });

  it('lets a visitor extinguish and relight the candles', () => {
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Birthday Cake' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Thổi nến ✨' }));
    expect(screen.getByText('Wish sent into the universe ✨')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thắp lại nến 🕯️' }));
    expect(screen.getByText('Make a wish, Trang!')).toBeInTheDocument();
  });

  it('loads a memory before enabling the puzzle', async () => {
    vi.stubGlobal('Image', class {
      onload: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    });
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Puzzle' })[0]);
    expect(await screen.findByRole('group', { name: '3 by 3 memory puzzle' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Start puzzle' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('opens Spotlight from the keyboard and opens a matching app', () => {
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const search = screen.getByRole('textbox', { name: 'Search birthday apps' });
    fireEvent.change(search, { target: { value: 'gallery' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gallery' }));
    expect(screen.getByRole('heading', { name: 'Memories' })).toBeInTheDocument();
  });

  it('keeps Settings actions in one action row and replays the surprise', () => {
    sessionStorage.setItem('birthday-booted', '1');
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Settings' })[0]);
    const actions = document.querySelector('.settings-buttons');
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Replay intro' }));
    expect(actions).toContainElement(screen.getByRole('button', { name: 'Reset celebration' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close window' }));
    fireEvent.click(screen.getByRole('button', { name: 'Surprise' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open gift 🎁' }));
    return waitFor(() => expect(screen.getByRole('button', { name: 'Replay surprise' })).toBeInTheDocument(), { timeout: 1500 });
  });
});
