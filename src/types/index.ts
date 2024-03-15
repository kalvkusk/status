export interface IndexData {
  chain_id: number
  epoch: string
  ledger_version: string
  oldest_ledger_version: string
  ledger_timestamp: string
  node_role: string
  oldest_block_height: string
  block_height: string
  git_hash: string
}

export interface SystemInfo {
  consensus_reward: number
  fees: number | string
  epoch_duration: string
  chain_id: number
  epoch: string
  ledger_version: string
  oldest_ledger_version: string
  ledger_timestamp: string
  node_role: string
  oldest_block_height: string
  block_height: string
  git_hash: string
  infra_escrow: number
  validator_seats: number
  vdf: number[]
  boundary_status: object
}

export interface ProofOfFee {
  val_universe: string[]
  bidders: string[]
  bids: number[]
  qualified: string[]
}

export interface SlowWalletBalance {
  unlocked: number
  total: number
}

export interface UserAccount {
  address: string
  in_val_set?: boolean
  active_vouchers?: string[] // Array of addresses
  all_vouchers?: string[] // Array of addresses
  balance?: SlowWalletBalance
}

export interface valData {
  current_list: string[] // Array of addresses
  eligible_validators: string[] // Array of addresses
  current_profiles: UserAccount[]
}

export interface govEventData {
  data: {
    num_votes: string
    proposal_id: string
    should_pass: boolean
    stake_pool: string
    voter: string
  }
}

export interface Transaction {
  sender: string,
  receiver: string,
  amount: number,
  ledger_version: number,
  ledger_timestamp: number,
}
