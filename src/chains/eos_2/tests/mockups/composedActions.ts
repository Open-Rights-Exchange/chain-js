import { toEosEntityName } from '../../helpers'

export const composedNewAccount = {
  account: toEosEntityName('eosio'),
  name: toEosEntityName('newaccount'),
  authorization: [
    {
      actor: toEosEntityName('creatoracc'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    creator: toEosEntityName('creatoracc'),
    name: toEosEntityName('accountname'),
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
}

export const composedCreate = [
  {
    account: toEosEntityName('eosio'),
    name: toEosEntityName('newaccount'),
    authorization: [
      {
        actor: toEosEntityName('creatoracc'),
        permission: toEosEntityName('active'),
      },
    ],
    data: {
      creator: toEosEntityName('creatoracc'),
      name: toEosEntityName('accountname'),
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
    account: toEosEntityName('eosio'),
    name: 'buyrambytes',
    authorization: [
      {
        actor: toEosEntityName('creatoracc'),
        permission: toEosEntityName('active'),
      },
    ],
    data: {
      payer: toEosEntityName('creatoracc'),
      receiver: toEosEntityName('accountname'),
      bytes: 3072,
    },
  },
  {
    account: toEosEntityName('eosio'),
    name: toEosEntityName('delegatebw'),
    authorization: [
      {
        actor: toEosEntityName('creatoracc'),
        permission: toEosEntityName('active'),
      },
    ],
    data: {
      from: toEosEntityName('creatoracc'),
      receiver: toEosEntityName('accountname'),
      stake_net_quantity: '1.0000 EOS',
      stake_cpu_quantity: '1.0000 EOS',
      transfer: false,
    },
  },
]

export const composedDeleteAuth = {
  account: toEosEntityName('eosio'),
  name: toEosEntityName('deleteauth'),
  authorization: [{ actor: toEosEntityName('authaccount'), permission: toEosEntityName('active') }],
  data: { account: toEosEntityName('accountname'), permission: toEosEntityName('permission') },
}

export const composedLinkAuth = {
  account: toEosEntityName('eosio'),
  name: toEosEntityName('linkauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    code: toEosEntityName('contract'),
    type: toEosEntityName('linkauth'),
    requirement: toEosEntityName('permission'),
  },
}

export const composedUnlinkAuth = {
  account: toEosEntityName('eosio'),
  name: toEosEntityName('unlinkauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    code: toEosEntityName('contract'),
    type: toEosEntityName('unlinkauth'),
  },
}

export const composedUpdateAuth = {
  account: toEosEntityName('eosio'),
  name: toEosEntityName('updateauth'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    account: toEosEntityName('accountname'),
    permission: toEosEntityName('permission'),
    parent: toEosEntityName('parent'),
    auth: {
      threshold: 1,
      accounts: [
        {
          permission: {
            actor: toEosEntityName('accountname'),
            permission: toEosEntityName('owner'),
          },
          weight: 1,
        },
      ],
      keys: [{ key: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma', weight: 1 }],
      waits: [
        {
          wait_sec: 1,
          weight: 1,
        },
      ],
    },
  },
}

export const composedCreateEscrowCreate = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('create'),
  authorization: [
    {
      actor: toEosEntityName('creator'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    memo: toEosEntityName('creator'),
    account: toEosEntityName('accountname'),
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    origin: 'app',
    referral: 'referral',
  },
}

export const composedCreateEscrowDefine = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('define'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    owner: toEosEntityName('accountname'),
    dapp: 'app',
    ram_bytes: '0',
    net: '1.0000 EOS',
    cpu: '1.0000 EOS',
    pricekey: '1',
    airdrop: {
      contract: toEosEntityName('airdroper'),
      tokens: '0.0000 AIR',
      limit: '0.0000 AIR',
    },
    rex: {},
    use_rex: false,
  },
}

export const composedCreateEscrowInit = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('init'),
  authorization: [
    {
      actor: toEosEntityName('createescrow'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    symbol: 'EOS,4',
    newaccountcontract: toEosEntityName('eosio'),
    newaccountaction: toEosEntityName('newaccount'),
    minimumram: '0',
  },
}

export const composedCreateEscrowReclaim = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('reclaim'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    reclaimer: toEosEntityName('accountname'),
    dapp: 'app',
    sym: 'EOS,4',
  },
}

export const composedCreateEscrowTransfer = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('transfer'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('accountname'),
    to: toEosEntityName('escrowname'),
    quantity: '10.0000 EOS',
    memo: 'memo',
  },
}

export const composedCreateEscrowWhitelist = {
  account: toEosEntityName('createescrow'),
  name: toEosEntityName('whitelist'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    owner: toEosEntityName('accountname'),
    account: toEosEntityName('whitelisted'),
    dapp: 'app',
  },
}

export const composedEosTokenApprove = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('approve'),
  authorization: [
    {
      actor: toEosEntityName('fromaccount'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '5.0000 EOS',
    memo: 'memo',
  },
}

export const composedEosTokenCreate = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('create'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    issuer: toEosEntityName('eosio.token'),
    maximum_supply: '10000.0000 EOS',
  },
}

export const composedEosTokenIssue = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('issue'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    to: toEosEntityName('eosio.token'),
    quantity: '1000.0000 EOS',
    memo: 'memoo',
  },
}

export const composedEosTokenRetire = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('retire'),
  authorization: [
    {
      actor: toEosEntityName('eosio'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    quantity: '1000.0000 EOS',
    memo: 'memo',
  },
}

export const composedEosTokenTransfer = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('transfer'),
  authorization: [
    {
      actor: toEosEntityName('fromaccount'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
}

export const composedEosTokenTransferFrom = {
  account: toEosEntityName('eosio.token'),
  name: toEosEntityName('transferFrom'),
  authorization: [
    {
      actor: toEosEntityName('approved'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    sender: toEosEntityName('approved'),
    from: toEosEntityName('fromaccount'),
    to: toEosEntityName('toaccount'),
    quantity: '100.0000 EOS',
    memo: 'memo',
  },
}

export const composedOreCreateAccount = {
  account: toEosEntityName('system.ore'),
  name: toEosEntityName('createoreacc'),
  authorization: [
    {
      actor: toEosEntityName('creator'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    creator: toEosEntityName('creator'),
    newname: toEosEntityName('accountname'), // Some versions of the system contract are running a different version of the newaccount code
    ownerkey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    activekey: 'EOS5vf6mmk2oU6ae1PXTtnZD7ucKasA3rUEzXyi5xR7WkzX8emEma',
    tier: '1',
    referral: 'referral',
  },
}

export const composedOreUpsertRight = {
  account: toEosEntityName('rights.ore'),
  name: toEosEntityName('upsertright'),
  authorization: [
    {
      actor: toEosEntityName('accountname'),
      permission: toEosEntityName('active'),
    },
  ],
  data: {
    issuer: toEosEntityName('accountname'),
    right_name: 'test',
    urls: 'www.aikon.com',
    issuer_whitelist: [toEosEntityName('accountname')],
  },
}
