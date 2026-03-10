import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import ReadingControls from "./ReadingControls";

const mockSeries = {
  slug: "mantras",
  title: "Mantras",
  image: "/series/mantras.svg",
};

const mockReads = [
  {
    slug: "mantra-1",
    title: "Mantra #1",
    date: "Enero 2026",
    isFavorite: false,
  },
  {
    slug: "mantra-2",
    title: "Mantra #2",
    date: "Enero 2026",
    isFavorite: true,
  },
];

describe("ReadingControls", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.stubGlobal("window", { location: { origin: "http://localhost:4173" } });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("renders read title and date", () => {
    render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={1}
      />,
    );
    expect(screen.getByText("Mantra #2")).toBeTruthy();
    expect(screen.getByText("Enero 2026")).toBeTruthy();
  });

  it("prev is disabled at index 0", () => {
    const { container } = render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={0}
      />,
    );
    const prevLink = container.querySelector('[aria-label="Lectura anterior"]');
    expect(prevLink?.getAttribute("aria-disabled")).toBe("true");
  });

  it("next is disabled at last index", () => {
    const { container } = render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={1}
      />,
    );
    const nextLink = container.querySelector(
      '[aria-label="Siguiente lectura"]',
    );
    expect(nextLink?.getAttribute("aria-disabled")).toBe("true");
  });

  it("prev is enabled when not at first", () => {
    const { container } = render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={1}
      />,
    );
    const prevLink = container.querySelector('[aria-label="Lectura anterior"]');
    expect(prevLink?.getAttribute("aria-disabled")).toBe("false");
  });

  it("next is enabled when not at last", () => {
    const { container } = render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={0}
      />,
    );
    const nextLink = container.querySelector(
      '[aria-label="Siguiente lectura"]',
    );
    expect(nextLink?.getAttribute("aria-disabled")).toBe("false");
  });

  it("share button copies URL to clipboard", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={0}
      />,
    );
    const shareButton = screen.getByLabelText("Compartir enlace");
    fireEvent.click(shareButton);

    expect(writeText).toHaveBeenCalledWith(
      "http://localhost:4173/writing/mantra-1",
    );
  });

  it("share shows confirmation then hides after timeout", async () => {
    render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={0}
      />,
    );
    const shareButton = screen.getByRole("button", {
      name: "Compartir enlace",
    });
    await act(async () => {
      fireEvent.click(shareButton);
    });

    expect(screen.getByText("¡Enlace copiado!")).toBeTruthy();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText("¡Enlace copiado!")).toBeNull();
  });

  it("favorite icon renders when isFavorite", () => {
    render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={1}
      />,
    );
    expect(screen.getByLabelText("Favorito del autor")).toBeTruthy();
  });

  it("favorite icon is absent when not isFavorite", () => {
    render(
      <ReadingControls
        series={mockSeries}
        reads={mockReads}
        currentIndex={0}
      />,
    );
    expect(screen.queryByLabelText("Favorito del autor")).toBeNull();
  });
});
