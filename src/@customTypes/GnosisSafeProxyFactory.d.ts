/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type ProxyCreation = ContractEventLog<{
  proxy: string;
  0: string;
}>;

export interface GnosisSafeProxyFactory extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): GnosisSafeProxyFactory;
  clone(): GnosisSafeProxyFactory;
  methods: {
    /**
     * Allows to create new proxy contact and execute a message call to the new proxy within one transaction.
     * @param data Payload for message call sent to new proxy contract.
     * @param masterCopy Address of master copy.
     */
    createProxy(
      masterCopy: string,
      data: string | number[]
    ): NonPayableTransactionObject<string>;

    /**
     * Allows to retrieve the runtime code of a deployed Proxy. This can be used to check that the expected Proxy was deployed.
     */
    proxyRuntimeCode(): NonPayableTransactionObject<string>;

    /**
     * Allows to retrieve the creation code used for the Proxy deployment. With this it is easily possible to calculate predicted address.
     */
    proxyCreationCode(): NonPayableTransactionObject<string>;

    /**
     * Allows to create new proxy contact and execute a message call to the new proxy within one transaction.
     * @param _mastercopy Address of master copy.
     * @param initializer Payload for message call sent to new proxy contract.
     * @param saltNonce Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
     */
    createProxyWithNonce(
      _mastercopy: string,
      initializer: string | number[],
      saltNonce: number | string | BN
    ): NonPayableTransactionObject<string>;

    /**
     * Allows to create new proxy contact, execute a message call to the new proxy and call a specified callback within one transaction
     * @param _mastercopy Address of master copy.
     * @param callback Callback that will be invoced after the new proxy contract has been successfully deployed and initialized.
     * @param initializer Payload for message call sent to new proxy contract.
     * @param saltNonce Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
     */
    createProxyWithCallback(
      _mastercopy: string,
      initializer: string | number[],
      saltNonce: number | string | BN,
      callback: string
    ): NonPayableTransactionObject<string>;

    /**
     * Allows to get the address for a new proxy contact created via `createProxyWithNonce`      This method is only meant for address calculation purpose when you use an initializer that would revert,      therefore the response is returned with a revert. When calling this method set `from` to the address of the proxy factory.
     * @param _mastercopy Address of master copy.
     * @param initializer Payload for message call sent to new proxy contract.
     * @param saltNonce Nonce that will be used to generate the salt to calculate the address of the new proxy contract.
     */
    calculateCreateProxyWithNonceAddress(
      _mastercopy: string,
      initializer: string | number[],
      saltNonce: number | string | BN
    ): NonPayableTransactionObject<string>;
  };
  events: {
    ProxyCreation(cb?: Callback<ProxyCreation>): EventEmitter;
    ProxyCreation(
      options?: EventOptions,
      cb?: Callback<ProxyCreation>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "ProxyCreation", cb: Callback<ProxyCreation>): void;
  once(
    event: "ProxyCreation",
    options: EventOptions,
    cb: Callback<ProxyCreation>
  ): void;
}
