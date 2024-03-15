import { transactions } from '.'

async function queryTransactions(offset = 0, limit = 100) {
  const transactions = await fetch('https://api.0l.fyi/graphql', {
    headers: {
      accept: '*/*',
      'accept-language': 'en,zh-CN;q=0.9,zh;q=0.8,eu;q=0.7',
      'content-type': 'application/json',
      'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({
      operationName: 'GetUserTransactions',
      variables: {
        limit: limit,
        offset: offset,
      },
      query:
        'query GetUserTransactions($limit: Int!, $offset: Int!) {\n  userTransactions(limit: $limit, offset: $offset, order: "DESC") {\n    size\n    items {\n      version\n      sender\n      moduleAddress\n      moduleName\n      functionName\n      timestamp\n      success\n      __typename\n    }\n    __typename\n  }\n}',
    }),
    method: 'POST',
  }).then((res) => res.json())
  return transactions.data.userTransactions
}

async function getTransactionDetail(version) {
  const data = await fetch(`https://rpc.0l.fyi/v1/transactions/by_version/${version}`).then((res) =>
    res.json(),
  )
  return data.payload.arguments
}
let isFetching = false;
export async function fetchTransactions() {
  if (isFetching) return;
  const endTime = (Date.now() - 3 * 24 * 60 * 60 * 1000) * 1_000;
  const minAmount = 1_000 * 1e6;
  const limit = 200
  let page = 0
  const { size } = await queryTransactions(0, 1)
  const totalPage = Math.ceil(size / limit)
  let allTransferList = []
  isFetching = true;
  for (page = 0; page < totalPage; page++) {
    try {
      const { items } = await queryTransactions(page * limit, limit)
      if (items[0] && items[0].timestamp < endTime) {
        break
      }
      let transferList = items.filter(
        (item) =>
          item.functionName === 'transfer' && item.success && item.timestamp >= endTime,
      )

      const details = await Promise.all(
        transferList.map((item) => getTransactionDetail(item.version)),
      )

      transferList = transferList.map((item, index) => {
        const [receiver, amount] = details[index]
        return {
          sender: item.sender.toLowerCase(),
          receiver: receiver.slice(2).toLowerCase(),
          amount: amount,
          ledger_version: item.version,
          ledger_timestamp: item.timestamp.toString(),
        }
      })
      allTransferList = allTransferList.concat(transferList.filter(t => t.amount >= minAmount));
      console.log(`${page + 1}/${totalPage}`)
    } catch (error) {
      console.log('Fetch error, will retry after 3s')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      page-- // Retry the same page
    }
  }
  transactions.set(allTransferList)
  isFetching = false
}

// fetchTransactions()
