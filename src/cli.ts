import { Emit, EventType } from "@emit-js/emit"
import * as findUp from "find-up"
import { readJson } from "fs-extra"
import * as getopts from "getopts"
import * as globWithCallback from "glob"
import { dirname } from "path"
import { promisify } from "util"

const glob = promisify(globWithCallback)

declare module "@emit-js/emit" {
  interface Emit {
    cli(id: EventIdType): Promise<any>
  }
}

export class Cli {
  public async cli(e: EventType): Promise<any> {
    const { emit } = e
    const argv = getopts(process.argv.slice(2))

    let [eventId, ...args] = argv._
    delete argv._

    let configPath

    [eventId, configPath] = await this.updateFromConfig(
      argv, eventId
    )

    const composerPath = await this.findComposerPath(
      configPath, eventId
    )

    require(composerPath)[eventId](emit)

    const finalArgs =
      Object.keys(argv).length ? [...args, argv] : args
    
    const finalEventId = eventId.replace(/@[^/]+\//, "")
    
    return emit.emit(finalEventId, ...finalArgs)
  }

  private async findComposerPath(
    configPath: string,
    eventId: string
  ): Promise<string> {
    const root = configPath
      ? dirname(configPath)
      : process.cwd()
    
    const pattern = `${root}/**/dist/${eventId}.js`

    const paths = await glob(pattern, {
      ignore: "**/node_modules/**"
    })

    let path =
      paths.find((path): boolean => path.indexOf("/dist/") > -1) ||
      paths[0]

    if (!path) {
      path = require.resolve(eventId)
    }

    return path
  }

  private async updateFromConfig(
    argv: getopts.ParsedOptions,
    eventId: string
  ): Promise<[string, string]> {
    const configPath = await findUp("emit.json")

    if (configPath) {
      const config = (await readJson(configPath))[eventId]

      if (config.eventId) {
        eventId = config.eventId
        delete config.eventId
      }

      Object.assign(argv, config)
    }

    return [eventId, configPath]
  }
}

export function cli(emit: Emit): void {
  const cli = new Cli()
  emit.any("cli", cli.cli.bind(cli))
}
