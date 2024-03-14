<script lang="ts">
  import { Transaction } from '../types'

  export let transactions: Transaction[] = []
</script>

<main>
  <table class="uk-table uk-table-responsive uk-table-divider">
    <thead>
    sender,receiver,amount,version,timestamp
    <tr>
      <th>Sender</th>
      <th>Receiver</th>
      <th>Amount</th>
      <th>Version</th>
      <th>Timestamp</th>
    </tr>
    </thead>
    <tbody>
    {#if transactions.length > 0}
      {#each transactions as tx}
        <tr>
          <td>{tx.sender}</td>
          <td>{tx.receiver}</td>
          <td>{tx.amount}</td>
          <td>{tx.ledger_version}</td>
          <td>{tx.ledger_timestamp}</td>
        </tr>
      {/each}
    {/if}
    </tbody>
  </table>
</main>
