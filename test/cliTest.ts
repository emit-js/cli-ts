import { Emit } from "@emit-js/emit"
import { cli } from "../"

let emit: Emit

beforeEach((): void => {
  emit = new Emit()
  cli(emit)
})

test("cli", (): void => {
  expect(cli).not.toBeUndefined()
})
