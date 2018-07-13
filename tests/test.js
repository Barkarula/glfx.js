import fx from "../src/index";

describe("Google", () => {
  beforeAll(async () => {
    await page.goto("https://google.com");
  });

  it('should display "google" text on page', async () => {
    await expect(page).toMatch("google");
  });
});

const canvas = fx.canvas();
const image = new Image(100, 200);

function initialiseTests() {
  return new Promise(resolve => {
    image.addEventListener(
      "load",
      function() {
        resolve(true);
      },
      false
    );
  });
  image.src = "./browser/yosemite.jpg";
}

beforeAll(async () => {
  await initialiseTests();
});

test("Canvas draw", () => {
  const texture = canvas.texture(image);
  canvas.draw(texture);
});
