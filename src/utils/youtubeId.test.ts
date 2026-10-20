import { describe, expect, it } from "vitest";
import { extrairYoutubeId } from "./youtubeId";

describe("extrairYoutubeId — só vídeo normal do YouTube", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?feature=share&v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["http://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?si=abc", "dQw4w9WgXcQ"],
    ["  https://youtu.be/dQw4w9WgXcQ  ", "dQw4w9WgXcQ"],
  ])("%s → %s", (url, id) => {
    expect(extrairYoutubeId(url)).toBe(id);
  });

  it.each([
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/live/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=curto",
    "https://www.youtube.com/watch",
    "https://vimeo.com/123456",
    "https://notyoutube.com/watch?v=dQw4w9WgXcQ",
    "ftp://youtube.com/watch?v=dQw4w9WgXcQ",
    "dQw4w9WgXcQ",
    "",
  ])("%s → null", (url) => {
    expect(extrairYoutubeId(url)).toBeNull();
  });
});
