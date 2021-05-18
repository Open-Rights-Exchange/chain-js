/**
 * The PlugIn interface declares the high-level interface to create a plugin for ChainJs
 */

import { Chain } from './chain'

export enum PluginType {
  MultiSig = 'multisig',
}

export class ChainJsPlugin {
  /** Plugin name */
  public name: string

  /** Plugin type */
  public type: PluginType

  /** Plugin options */
  protected _options: any

  /** Chainstate - will be set automatically when plugin installed - do not set this */
  public chainState: Chain

  get options() {
    return this._options
  }

  /** Initializes plugin using options */
  init(options: any) {
    this._options = options
  } // eslint-disable-line @typescript-eslint/no-unused-vars
}
