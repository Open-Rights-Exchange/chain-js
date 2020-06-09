export const createAccount = [
  {
    account: 'eosio',
    name: 'newaccount',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      creator: 'creatoracc',
      name: 'accountName',
      owner: {
        threshold: 1,
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
      active: {
        threshold: 1,
        keys: [
          {
            key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
            weight: 1,
          },
        ],
        accounts: Array<any>(),
        waits: Array<any>(),
      },
    },
  },
  {
    account: 'eosio',
    name: 'buyrambytes',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      payer: 'creatoracc',
      receiver: 'accountName',
      bytes: 3072,
    },
  },
  {
    account: 'eosio',
    name: 'delegatebw',
    authorization: [
      {
        actor: 'creatoracc',
        permission: 'active',
      },
    ],
    data: {
      from: 'creatoracc',
      receiver: 'accountName',
      stake_net_quantity: '1.0000 EOS',
      stake_cpu_quantity: '1.0000 EOS',
      transfer: false,
    },
  },
]

export const deleteAuth = {
  account: 'eosio',
  name: 'deleteauth',
  authorization: [{ actor: 'authAccount', permission: 'authPermission' }],
  data: { account: 'accountName', permission: 'permission' },
}

export const linkAuth = {
  account: 'eosio',
  name: 'linkauth',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    account: 'accountName',
    code: 'contract',
    type: 'linkauth',
    requirement: 'permission',
  },
}

export const unlinkAuth = {
  account: 'eosio',
  name: 'unlinkauth',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    account: 'accountName',
    code: 'contract',
    type: 'unlinkauth',
  },
}

export const updateAuth = {
  account: 'eosio',
  name: 'updateauth',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    account: 'accountName',
    permission: 'permission',
    parent: 'parent',
    auth: 'auth',
  },
}

export const createEscrowCreate = {
  account: 'createescrow',
  name: 'create',
  authorization: [
    {
      actor: 'creator',
      permission: 'active',
    },
  ],
  data: {
    memo: 'creator',
    account: 'accountName',
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    origin: 'app',
    referral: 'referral',
  },
}

export const createEscrowDefine = {
  account: 'createescrow',
  name: 'define',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    owner: 'accountName',
    dapp: 'app',
    ram_bytes: '0',
    net: '1.0000 EOS',
    cpu: '1.0000 EOS',
    pricekey: '1',
    airdrop: {
      contract: 'airdroper',
      tokens: '0.0000 AIR',
      limit: '0.0000 AIR',
    },
    rex: {},
    use_rex: false,
  },
}

export const createEscrowInit = {
  account: 'createescrow',
  name: 'init',
  authorization: [
    {
      actor: 'createescrow',
      permission: 'active',
    },
  ],
  data: {
    symbol: 'EOS,4',
    newaccountcontract: 'eosio',
    newaccountaction: 'newaccount',
    minimumram: '0',
  },
}

export const createEscrowReclaim = {
  account: 'createescrow',
  name: 'reclaim',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    reclaimer: 'accountName',
    dapp: 'app',
    sym: 'EOS,4',
  },
}

export const createEscrowTransfer = {
  account: 'createescrow',
  name: 'transfer',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    from: 'accountName',
    to: 'escrowname',
    quantity: '10.0000 EOS',
    memo: 'memo',
  },
}

export const createEscrowWhitelist = {
  account: 'createescrow',
  name: 'whitelist',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    owner: 'accountName',
    account: 'whitelisted',
    dapp: 'app',
  },
}

export const eosTokenApprove = {
  account: 'eosio.token',
  name: 'approve',
  authorization: [
    {
      actor: 'fromaccount',
      permission: 'active',
    },
  ],
  data: {
    from: 'fromaccount',
    to: 'toaccount',
    quantity: '5.0000 EOS',
    memo: 'memo',
  },
}

export const eosTokenCreate = {
  account: 'eosio.token',
  name: 'create',
  authorization: [
    {
      actor: 'eosio',
      permission: 'active',
    },
  ],
  data: {
    issuer: 'eosio.token',
    maximum_supply: '10000.0000 EOS',
  },
}

export const eosTokenIssue = {
  account: 'eosio.token',
  name: 'issue',
  authorization: [
    {
      actor: 'eosio',
      permission: 'active',
    },
  ],
  data: {
    to: 'eosio.token',
    quantity: '1000.0000 EOS',
    memo: 'memoo',
  },
}

export const eosTokenRetire = {
  account: 'eosio.token',
  name: 'retire',
  authorization: [
    {
      actor: 'eosio',
      permission: 'active',
    },
  ],
  data: {
    quantity: '1000.0000 EOS',
    memo: 'memo',
  },
}

export const eosTokenTransfer = {
  account: 'eosio.token',
  name: 'transfer',
  authorization: [
    {
      actor: 'fromaccount',
      permission: 'active',
    },
  ],
  data: {
    from: 'fromaccount',
    to: 'toaccount',
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
}

export const eosTokenTransferFrom = {
  account: 'eosio.token',
  name: 'transferFrom',
  authorization: [
    {
      actor: 'approved',
      permission: 'active',
    },
  ],
  data: {
    sender: 'approved',
    from: 'fromaccount',
    to: 'toaccount',
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
}

export const oreCreateAccount = {
  account: 'system.ore',
  name: 'createoreacc',
  authorization: [
    {
      actor: 'creator',
      permission: 'active',
    },
  ],
  data: {
    creator: 'creator',
    newname: 'accountName', // Some versions of the system contract are running a different version of the newaccount code
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    pricekey: '1',
    referral: 'referral',
  },
}

export const oreUpsertRight = {
  account: 'rights.ore',
  name: 'upsertright',
  authorization: [
    {
      actor: 'accountName',
      permission: 'active',
    },
  ],
  data: {
    issuer: 'accountName',
    right_name: 'test',
    urls: 'www.aikon.com',
    issuer_whitelist: '[accountName]',
  },
}
