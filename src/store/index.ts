import { writable, get } from 'svelte/store'
import moment from 'moment'
import { postViewFunc, getIndex, getAccountResource, getEventList } from '../api'
import type {
  UserAccount,
  valData,
  IndexData,
  SystemInfo,
  ProofOfFee,
  govEventData,
} from '../types'
import * as systemPayloads from '../api/payloads/system'
import * as validatorPayloads from '../api/payloads/validators'
import * as commonPayloads from '../api/payloads/common'
import { govEvents } from '../api/payloads/events'
import { fetchTransactions } from './transactions.js'

export interface User {
  address: string
}

// Writable stores
export const apiUrl = writable<string>()
export const apiUrlNote = writable<string>()

export const validatorList = writable<[]>([])
export const systemInfo = writable<SystemInfo>()
export const pofInfo = writable<ProofOfFee>()

export const commonInfo = writable<object>({})
export const indexStore = writable<object>({})
export const indexDataStore = writable<IndexData>()
export const valDataStore = writable<valData>()
export const selectedAccount = writable<UserAccount>({ address: '' })
export const govStore = writable<govEventData[]>()

export const setAccount = (address: string) => {
  selectedAccount.set({
    address,
  })
  // saveToLocalStorage('selectedUser', a)
}

export const getIndexData = async () => {
  try {
    const data = await getIndex()
    indexDataStore.set(data)
  } catch (error) {
    console.error(`Failed to get index data: ${error}`)
  }
}

export const getValidators = async () => {
  const requests = [
    postViewFunc(validatorPayloads.eligible_validators_payload),
    postViewFunc(validatorPayloads.current_validators_payload),
  ]

  const [eligible, active_set] = await Promise.all(requests)

  // const profiles = await fetchUserAccounts(active_set[0])

  const vals: valData = {
    eligible_validators: eligible[0],
    current_list: active_set[0],
    current_profiles: [],
  }
  valDataStore.set(vals)
}

export const fetchUserAccounts = async (accounts: string[]): Promise<UserAccount[]> => {
  if (accounts.length == 0) throw 'no accounts'

  const accountsData: UserAccount[] = []
  for (const address of accounts) {
    const u: UserAccount = {
      address,
    }

    // await populateVouchers(u)
    accountsData.push(u)
  }

  return accountsData
}

export const populateVouchers = async (user: UserAccount): Promise<UserAccount> => {
  const requests = [
    postViewFunc(validatorPayloads.all_vouchers_payload(user.address)),
    postViewFunc(validatorPayloads.vouchers_in_val_set_payload(user.address)),
  ]

  const [buddies_res, buddies_in_set_res] = await Promise.all(requests)

  user.active_vouchers = buddies_in_set_res[0]
  user.all_vouchers = buddies_res[0]

  return user
}

export const populateBalance = async (user: UserAccount): Promise<UserAccount> => {
  const requests = [postViewFunc(commonPayloads.account_balance_payload(user.address))]

  const [bal_res] = await Promise.all(requests)

  user.balance = {
    unlocked: bal_res[0],
    total: bal_res[1],
  }

  return user
}

export const getSystemInfo = async () => {
  try {
    // TODO(zoz): it would be better to let these be async and parallel
    const requests = [
      postViewFunc(systemPayloads.fees_collected_payload),
      postViewFunc(systemPayloads.epoch_length_payload),
      postViewFunc(systemPayloads.vdf_difficulty),
      postViewFunc(systemPayloads.infra_balance),
      getAccountResource('0x1', '0x1::musical_chairs::Chairs'),
      getAccountResource('0x1', '0x1::epoch_boundary::BoundaryStatus'),
      getAccountResource('0x1', '0x1::proof_of_fee::ConsensusReward'),
    ]
    const [fees, epochResponse, vdfDifficulty, infraBalance, chairs, boundaryStatus, cr] =
      await Promise.all(requests)

    const duration = moment.duration(Number(epochResponse[0]), 'seconds') // Cast to Number
    const epoch = `${Math.floor(duration.asHours())} hrs : ${duration.minutes()} mins`
    const indexData = get(indexDataStore)

    console.log('cr', cr)
    // TODO(zoz): make this an interface
    const newSystemInfo: SystemInfo = {
      consensus_reward: cr.nominal_reward,
      fees: fees[0],
      epoch_duration: epoch,
      vdf: vdfDifficulty,
      infra_escrow: infraBalance[0],
      validator_seats: chairs.seats_offered,
      boundary_status: boundaryStatus,
      ...indexData,
    }

    systemInfo.set(newSystemInfo)

    // Save to local storage
    // saveToLocalStorage('systemInfo', newSystemInfo)
  } catch (error) {
    console.error(`Failed to get system info: ${error}`)
  }
}

// Function to refresh all data
export const refresh = async () => {
  try {
    // this should be done async, without the await
    getIndexData()
    getSystemInfo()
    getValidators()
    fetchTransactions()
    getEventList(govEvents()).then((res) => govStore.set(res))
  } catch (error) {
    console.error(`Failed to refresh: ${error}`)
  }
}
