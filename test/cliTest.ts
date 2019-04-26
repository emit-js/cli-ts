import { Cli } from "../"
import { join } from "path"

const root = join(__dirname, "../")

test("can't find composer", async (): Promise<void> => {
  const cli = new Cli()
  await expect(
    cli["findComposerPath"](root, "test-does-not-exist")
  ).rejects.toThrow()
})

test("find composer", async (): Promise<void> => {
  const cli = new Cli()
  expect(
    await cli["findComposerPath"](root, "cli")
  ).toBe(`${root}dist/cli.js`)
})
