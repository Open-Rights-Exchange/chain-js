// export function getParamFromTxEvent(transaction, eventName, paramName, contract, contractFactory, subject) {
//   assert.isObject(transaction)
//   if (subject != null) {
//     logGasUsage(subject, transaction)
//   }
//   let { logs } = transaction
//   if (eventName != null) {
//     logs = logs.filter(l => l.event === eventName && l.address === contract)
//   }
//   assert.equal(logs.length, 1, 'too many logs found!')
//   const param = logs[0].args[paramName]
//   if (contractFactory != null) {
//     const contract = contractFactory.at(param)
//     assert.isObject(contract, `getting ${paramName} failed for ${param}`)
//     return contract
//   }
//   return param
// }
