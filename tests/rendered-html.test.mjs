import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const invitePageUrl = new URL("../app/invito/page.tsx", import.meta.url);
const inviteCssUrl = new URL("../app/invito/invito.module.css", import.meta.url);

test("keeps the public invite complete and separate", async () => {
  const page = await readFile(invitePageUrl, "utf8");

  for (const section of ["home", "storia", "programma", "rsvp", "album"]) {
    assert.match(page, new RegExp(`<section id=["']${section}["']`));
  }

  assert.ok(page.indexOf('id="rsvp"') < page.indexOf('id="album"'));
  assert.match(page, /setInterval\(aggiorna, 1000\)/);
  assert.match(page, /giada-francesco-storia-01\.jpeg/);
  assert.match(page, /localStorage\.setItem\("invito-giada-francesco-rsvp"/);
});

test("keeps Maps links and album uploads safe for the demo", async () => {
  const page = await readFile(invitePageUrl, "utf8");

  assert.match(page, /google\.com\/maps\/search\/\?api=1&query=/);
  assert.equal((page.match(/target="_blank"/g) ?? []).length, 2);
  assert.equal((page.match(/rel="noopener noreferrer"/g) ?? []).length, 2);
  assert.match(page, /accept="image\/\*,video\/\*"/);
  assert.match(page, /\bmultiple\b/);
  assert.match(page, /URL\.createObjectURL\(file\)/);
  assert.match(page, /removeAlbumFile/);
  assert.match(page, /i file non sono stati inviati né salvati/i);
  assert.doesNotMatch(page, /fetch\(|XMLHttpRequest|FormData\([^)]*album/i);
});

test("provides a responsive invite layout", async () => {
  const css = await readFile(inviteCssUrl, "utf8");

  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /\.storyGrid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.rsvp form\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /\.photoLarge img\s*\{[^}]*width:\s*100%[^}]*height:\s*auto/s);
  assert.match(css, /\.filePreview\s*\{[^}]*grid-template-columns:\s*54px minmax\(0,1fr\) 36px/s);
});
