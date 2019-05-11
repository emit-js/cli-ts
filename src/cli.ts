import { Emit, EventType } from "@emit-js/emit"
import * as findUp from "find-up"
import { readJson } from "fs-extra"
import * as getopts from "getopts"
import * as globWithCallback from "glob"
import { dirname, join } from "path"
import { promisify } from "util"

const glob = promisify(globWithCallback)

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

    await emit.listen(import(composerPath))

    const hasArgv = Object.keys(argv).length
    const paths = await this.globPaths(argv)
    
    return Promise.all(
      paths.map(async (cwd): Promise<any> =>
        emit.emit(
          [
            eventName,
            ...(hasArgv && argv.id ? argv.id : [])
          ],
          ...args,
          ...(hasArgv ? [{ ...argv, cwd }] : [])
        )
      )
    )
  }

  private deepMerge(argv: object, config: object): void {
    for (const key in config) {
      const a = argv[key]
      const c = config[key]
      if (a && Array.isArray(c)) {
        argv[key] = c.concat(a)
      } else {
        argv[key] = c
      }
    }
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

  private async globPaths(
    argv: getopts.ParsedOptions
  ): Promise<string[]> {
    if (!argv.paths) {
      return [process.cwd()]
    }
    return await glob(argv.paths, {
      ignore: "**/node_modules/**"
    })
  }

  private async updateFromConfig(
    argv: getopts.ParsedOptions,
    cwd: string | undefined,
    eventName: string
  ): Promise<[string, string]> {
    const configPath = await findUp("emit.json", { cwd })

    if (configPath) {
      const { defaultArgs, events } = await readJson(
        configPath
      )
      
      const config = events[eventName]

      if (config) {
        if (config.eventName) {
          eventName = config.eventName
          delete config.eventName
        }

        this.deepMerge(argv, config)
        
        if (defaultArgs) {
          if (typeof defaultArgs.paths === "string") {
            defaultArgs.paths = join(
              dirname(configPath), defaultArgs.paths
            )
          }
          Object.assign(argv, { ...defaultArgs, ...argv })
        }
      }
    }

    return [eventName, configPath]
  }
}

declare module "@emit-js/emit" {
  interface Emit {
    cli(id: EventIdType): Promise<any>
  }
}

export function cli(emit: Emit): void {
  const cli = new Cli()
  emit.any("cli", cli.cli.bind(cli))
}

export const listen = cli
