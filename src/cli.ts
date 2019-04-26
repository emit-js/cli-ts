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

    let [eventName, ...args] = argv._
    delete argv._

    let configPath

    [eventName, configPath] = await this.updateFromConfig(
      argv, undefined, eventName
    )

    const composerPath = await this.findComposerPath(
      configPath, eventName
    )

    require(composerPath)[eventName](emit)

    const finalArgs =
      Object.keys(argv).length ? [...args, argv] : args
    
    const finalEventId = eventName.replace(/@[^/]+\//, "")
    
    return emit.emit(finalEventId, ...finalArgs)
  }

  private async findComposerPath(
    configPath: string,
    eventName: string
  ): Promise<string> {
    const root = configPath
      ? dirname(configPath)
      : process.cwd()
    
    const pattern = `${root}/**/dist/${eventName}.js`

    const paths = await glob(pattern, {
      ignore: "**/node_modules/**"
    })

    let path =
      paths.find((path): boolean => path.indexOf("/dist/") > -1) ||
      paths[0]

    if (!path) {
      path = require.resolve(eventName)
    }

    return path
  }

  private async updateFromConfig(
    argv: getopts.ParsedOptions,
    cwd: string | undefined,
    eventName: string
  ): Promise<[string, string]> {
    const configPath = await findUp("emit.json", { cwd })

    if (configPath) {
      const config = (await readJson(configPath))[eventName]

      if (config) {
        if (config.eventName) {
          eventName = config.eventName
          delete config.eventName
        }

        Object.assign(argv, config)
      }
    }

    return [eventName, configPath]
  }
}

export function cli(emit: Emit): void {
  const cli = new Cli()
  emit.any("cli", cli.cli.bind(cli))
}
