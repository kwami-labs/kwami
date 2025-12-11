/**
 * TypeScript type definitions for QWAMI Token Anchor program
 * Generated from the Anchor IDL
 */

export type QwamiToken = {
  version: '1.5.11'
  name: 'qwami_token'
  instructions: [
    {
      name: 'initialize'
      accounts: [
        { name: 'mint'; isMut: true; isSigner: true },
        { name: 'tokenAuthority'; isMut: true; isSigner: false },
        { name: 'payer'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false }
      ]
      args: [{ name: 'authorityBump'; type: 'u8' }]
    },
    {
      name: 'mintTokens'
      accounts: [
        { name: 'mint'; isMut: true; isSigner: false },
        { name: 'tokenAuthority'; isMut: true; isSigner: false },
        { name: 'destination'; isMut: true; isSigner: false },
        { name: 'authority'; isMut: false; isSigner: true },
        { name: 'tokenProgram'; isMut: false; isSigner: false }
      ]
      args: [{ name: 'amount'; type: 'u64' }]
    },
    {
      name: 'burnTokens'
      accounts: [
        { name: 'mint'; isMut: true; isSigner: false },
        { name: 'tokenAuthority'; isMut: true; isSigner: false },
        { name: 'source'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: false; isSigner: true },
        { name: 'tokenProgram'; isMut: false; isSigner: false }
      ]
      args: [{ name: 'amount'; type: 'u64' }]
    }
  ]
  accounts: [
    {
      name: 'tokenAuthority'
      type: {
        kind: 'struct'
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'mint'; type: 'publicKey' },
          { name: 'totalMinted'; type: 'u64' },
          { name: 'totalBurned'; type: 'u64' },
          { name: 'basePriceUsdCents'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ]
      }
    }
  ]
  errors: [
    { code: 6000; name: 'MaxSupplyExceeded'; msg: 'Maximum supply exceeded' },
    { code: 6001; name: 'InvalidAuthority'; msg: 'Invalid authority' },
    { code: 6002; name: 'InvalidPrice'; msg: 'Invalid price' },
    { code: 6003; name: 'MathOverflow'; msg: 'Math overflow' }
  ]
}
