import { Contract, GlobalState, Txn, assert, bytes, uint64, Uint64, itxn } from '@algorandfoundation/algorand-typescript'

// Contract that transfers exactly 1 unit of a specified ASA from the app account
// to a receiver using an inner asset transfer transaction.
export class OneAsaTransfer extends Contract {
  // Store the app owner (creator) in global state under key 'owner'
  owner = GlobalState<bytes>({ key: 'owner' })

  // On create, set the owner to the transaction sender
  public create(): void {
    // Store the creator's address bytes
    this.owner.value = Txn.sender.bytes
  }

  // Transfer exactly 1 unit of asset `assetId` to `receiver`.
  // Only callable by the owner set at creation.
  public transfer(assetId: uint64, receiver: bytes): void {
    // Ensure only the owner can call
    assert(Txn.sender.bytes.equals(this.owner.value))

    // Use the itxn.assetTransfer factory to construct and submit an inner txn
    itxn.assetTransfer({
      xferAsset: assetId,
      // Transfer exactly 1 unit (Uint64 helper creates the proper uint64 type)
      assetAmount: Uint64(1),
      assetReceiver: receiver,
    }).submit()
  }
}
