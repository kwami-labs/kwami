/**
 * TypeScript type definitions for KWAMI NFT Anchor program
 * Generated from the Anchor IDL
 */

export type KwamiNft = {
  version: '1.5.9'
  name: 'kwami_nft'
  instructions: [
    {
      name: 'initialize'
      accounts: [
        { name: 'collectionMint'; isMut: true; isSigner: true },
        { name: 'collectionAuthority'; isMut: true; isSigner: false },
        { name: 'dnaRegistry'; isMut: true; isSigner: false },
        { name: 'payer'; isMut: true; isSigner: true },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false }
      ]
      args: [{ name: 'collectionBump'; type: 'u8' }]
    },
    {
      name: 'mintKwami'
      accounts: [
        { name: 'mint'; isMut: true; isSigner: true },
        { name: 'kwamiNft'; isMut: true; isSigner: false },
        { name: 'collectionAuthority'; isMut: true; isSigner: false },
        { name: 'dnaRegistry'; isMut: true; isSigner: false },
        { name: 'metadata'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'metadataProgram'; isMut: false; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
        { name: 'tokenProgram'; isMut: false; isSigner: false },
        { name: 'rent'; isMut: false; isSigner: false }
      ]
      args: [
        { name: 'dnaHash'; type: { array: ['u8', 32] } },
        { name: 'name'; type: 'string' },
        { name: 'symbol'; type: 'string' },
        { name: 'uri'; type: 'string' }
      ]
    },
    {
      name: 'updateMetadata'
      accounts: [
        { name: 'kwamiNft'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: false; isSigner: true }
      ]
      args: [{ name: 'newUri'; type: 'string' }]
    },
    {
      name: 'burnKwami'
      accounts: [
        { name: 'kwamiNft'; isMut: true; isSigner: false },
        { name: 'mint'; isMut: true; isSigner: false },
        { name: 'dnaRegistry'; isMut: true; isSigner: false },
        { name: 'owner'; isMut: true; isSigner: true },
        { name: 'tokenProgram'; isMut: false; isSigner: false }
      ]
      args: []
    },
    {
      name: 'checkDnaExists'
      accounts: [{ name: 'dnaRegistry'; isMut: false; isSigner: false }]
      args: [{ name: 'dnaHash'; type: { array: ['u8', 32] } }]
      returns: 'bool'
    }
  ]
  accounts: [
    {
      name: 'collectionAuthority'
      type: {
        kind: 'struct'
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'collectionMint'; type: 'publicKey' },
          { name: 'totalMinted'; type: 'u64' },
          { name: 'bump'; type: 'u8' }
        ]
      }
    },
    {
      name: 'dnaRegistry'
      type: {
        kind: 'struct'
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'collection'; type: 'publicKey' },
          { name: 'dnaHashes'; type: { vec: { array: ['u8', 32] } } },
          { name: 'dnaCount'; type: 'u64' }
        ]
      }
    },
    {
      name: 'kwamiNft'
      type: {
        kind: 'struct'
        fields: [
          { name: 'mint'; type: 'publicKey' },
          { name: 'owner'; type: 'publicKey' },
          { name: 'dnaHash'; type: { array: ['u8', 32] } },
          { name: 'mintedAt'; type: 'i64' },
          { name: 'updatedAt'; type: 'i64' },
          { name: 'metadataUri'; type: 'string' },
          { name: 'bump'; type: 'u8' }
        ]
      }
    }
  ]
  errors: [
    { code: 6000; name: 'MaxSupplyReached'; msg: 'Maximum supply reached' },
    { code: 6001; name: 'GenerationSupplyReached'; msg: 'Generation supply reached' },
    { code: 6002; name: 'DuplicateDNA'; msg: 'This DNA already exists' },
    { code: 6003; name: 'RegistryFull'; msg: 'DNA registry is full' },
    { code: 6004; name: 'InvalidOwner'; msg: 'Invalid owner' },
    { code: 6005; name: 'NameTooLong'; msg: 'Name too long' },
    { code: 6006; name: 'SymbolTooLong'; msg: 'Symbol too long' },
    { code: 6007; name: 'UriTooLong'; msg: 'URI too long' }
  ]
}

