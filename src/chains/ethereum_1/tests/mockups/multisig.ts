import { toGnosisSignature } from '../../plugins/multisig/gnosisSafeV1/helpers'

export const getSignatures = [
  toGnosisSignature(
    '{"signer":"0x31df49653c72933a4b99af6fb5d5b77cc169346a","data":"0xbf28af46373890040db70d95eac829c5851f484342733f37294142e0aee8fc7e7a74532991053d3aa8995f3520cf37018a5d952b38eded6e9c64bdae4514ee381f"}',
  ),
  toGnosisSignature(
    '{"signer":"0x76d1b5dcfe51dbeb3c489977faf2643272aad901","data":"0xa5b914680535b4bdbbd44bc8c3047d36db61e05d1dbbb9197aa9696b706f6ee36e43a24dfec0679a46393e49c08a1f6bf9b71d7ec54ba4edec99cb3565e9890f20"}',
  ),
]
