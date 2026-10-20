import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VideoLinkField } from ".";

vi.mock("@/components/atoms/youtubePlayer", () => ({
  YoutubePlayer: ({ videoId }: { videoId: string }) => <div data-testid="player">{videoId}</div>,
}));

describe("VideoLinkField", () => {
  it("digitar avisa a URL e o id extraído", () => {
    const onChange = vi.fn();
    render(<VideoLinkField value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Link do YouTube" }), {
      target: { value: "https://youtu.be/dQw4w9WgXcQ" },
    });
    expect(onChange).toHaveBeenCalledWith("https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ");
  });

  it("value válido renderiza o player; inválido mostra o erro e não renderiza", () => {
    const { rerender } = render(
      <VideoLinkField value="https://youtu.be/dQw4w9WgXcQ" onChange={vi.fn()} />,
    );
    expect(screen.getByTestId("player")).toHaveTextContent("dQw4w9WgXcQ");
    expect(screen.queryByRole("alert")).toBeNull();

    rerender(
      <VideoLinkField value="https://www.youtube.com/shorts/dQw4w9WgXcQ" onChange={vi.fn()} />,
    );
    expect(screen.queryByTestId("player")).toBeNull();
    expect(screen.getByRole("alert")).toHaveTextContent(/link do YouTube válido/);
  });

  it("vazio: nem player nem erro", () => {
    render(<VideoLinkField value="" onChange={vi.fn()} />);
    expect(screen.queryByTestId("player")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
