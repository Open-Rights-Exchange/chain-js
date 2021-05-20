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

  protected _isInitialized: boolean = false

  /** Chainstate - will be set automatically when plugin installed - do not set this */
  public chainState: Chain

  /** Initializes plugin using options
   *  If a plugin doesnt need to be inited, then hardcode protected _isInitialized = true */
  init(options: any) {
    this._options = options
    this._isInitialized = true
  } // eslint-disable-line @typescript-eslint/no-unused-vars
}
