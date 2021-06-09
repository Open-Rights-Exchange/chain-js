export const decomposedAssetCreate = [
  {
    chainActionType: 'AssetCreate',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetDefaultFrozen: false,
      assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetUnitName: 'exp',
      assetName: 'examplecoin',
      type: 'acfg',
    },
  },
]
export const decomposedAssetConfig = [
  {
    chainActionType: 'AssetConfig',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      assetManager: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetReserve: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetFreeze: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetClawback: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      type: 'acfg',
    },
  },
]
export const decomposedAssetFreeze = [
  {
    chainActionType: 'AssetFreeze',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      freezeState: true,
      type: 'afrz',
    },
  },
]

export const decomposedTokenTransfer: any = [
  {
    chainActionType: 'ValueTransfer',
    args: {
      amount: '1000',
      fromAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      toAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      memo: 'create',
      contractName: '12345',
      precision: null,
      symbol: null,
    },
  },
]

export const decomposedValueTransfer: any = [
  {
    chainActionType: 'ValueTransfer',
    args: {
      amount: '10',
      permission: null,
      fromAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      toAccountName: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      memo: 'create',
      contractName: null,
      symbol: 'algo',
    },
  },
]

export const decomposedAssetTransfer = [
  {
    chainActionType: 'TokenTransfer',
    args: {
      ...decomposedTokenTransfer[0].args,
    },
  },
  {
    chainActionType: 'AssetTransfer',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 1000,
      note: 'create',
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      assetIndex: 12345,
      assetRevocationTarget: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      type: 'axfer',
    },
  },
]
export const decomposedAssetDestroy = [
  {
    chainActionType: 'AssetDestroy',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'create',
      assetIndex: 12345,
      type: 'acfg',
    },
  },
]
export const decomposedKeyRegistration = [
  {
    chainActionType: 'KeyRegistration',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      nonParticipation: false,
      note: 'create',
      voteKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      selectionKey: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      voteFirst: 10,
      voteLast: 100000,
      voteKeyDilution: 100,
      type: 'keyreg',
    },
  },
]

export const decomposedPayment = [
  {
    chainActionType: 'ValueTransfer',
    args: {
      ...decomposedValueTransfer[0].args,
    },
  },
  {
    chainActionType: 'Payment',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      to: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      amount: 10,
      note: 'create',
      closeRemainderTo: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      type: 'pay',
    },
  },
]
export const decomposedAppCreate = [
  {
    chainActionType: 'AppCreate',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appIndex: 0,
      appOnComplete: 0,
      appLocalInts: 0,
      appLocalByteSlices: 0,
      appGlobalInts: 1,
      appGlobalByteSlices: 0,
      appApprovalProgram: '02200101260107636f756e746572284964220849350067340043',
      appClearProgram: '0220010122',
      type: 'appl',
    },
  },
]
export const decomposedAppUpdate = [
  {
    chainActionType: 'AppUpdate',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      appIndex: 13379916,
      appOnComplete: 4,
      appApprovalProgram: '02200101260107636f756e746572284964220849350067340043',
      appClearProgram: '0220010122',
      type: 'appl',
    },
  },
]
export const decomposedAppOptIn = [
  {
    chainActionType: 'AppOptIn',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test optIn',
      appIndex: 13379916,
      appOnComplete: 1,
      type: 'appl',
    },
  },
]
export const decomposedAppCloseOut = [
  {
    chainActionType: 'AppCloseOut',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test close out',
      appIndex: 13379916,
      appOnComplete: 2,
      type: 'appl',
    },
  },
]
export const decomposedAppNoOp = [
  {
    chainActionType: 'AppNoOp',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test noOp',
      appIndex: 13379916,
      appOnComplete: 0,
      appArgs: ['0x6d696e74', '0x2710'],
      type: 'appl',
    },
  },
]
export const decomposedAppClear = [
  {
    chainActionType: 'AppClear',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
      appOnComplete: 3,
      type: 'appl',
    },
  },
]
export const decomposedAppDelete = [
  {
    chainActionType: 'AppDelete',
    args: {
      name: 'Transaction',
      tag: 'TX',
      from: 'VBS2IRDUN2E7FJGYEKQXUAQX3XWL6UNBJZZJHB7CJDMWHUKXAGSHU5NXNQ',
      note: 'test clear',
      appIndex: 13379916,
      appOnComplete: 5,
      type: 'appl',
    },
  },
]
