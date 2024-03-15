<script>
  import 'uikit/dist/css/uikit.min.css'

  import { onMount } from 'svelte'
  import { initApi, setApi } from '../api'
  import { refresh, selectedAccount, apiUrl, apiUrlNote } from '../store'
  import SystemInfo from '../ui/SystemInfo.svelte'
  import Validators from '../ui/Validators.svelte'
  import AccountView from '../ui/AccountView.svelte'
  import BoundaryStatus from '../ui/BoundaryStatus.svelte'
  // import GovEvents from '../ui/GovEvents.svelte'
  import TransactionTable from '../ui/TransactionTable.svelte'
  onMount(async () => {
    await initApi() // ONLY DO THIS ONCE ON LOAD

    refresh()

    setInterval(
      refresh,
      30000, // 30 secs
    )
  })
</script>

<main class="uk-text-small">
  <div class="uk-grid">
    <div class="uk-column-1-2 uk-margin-bottom">
      <div class="">
        {#if $apiUrl}
          <input
            class="uk-input"
            type="text"
            placeholder={$apiUrl}
            aria-label="Input"
            bind:value={$apiUrl}
          />
          <button class="uk-button uk-button-default" on:click={setApi($apiUrl)}>update url</button>
          <button class="uk-button uk-button-default" on:click={refresh}>refresh</button>
          note: {$apiUrlNote}
        {/if}
      </div>
    </div>
    <div class="uk-flex">
      {#if $selectedAccount && $selectedAccount.address}
        <AccountView />
      {:else}
        <SystemInfo />
        <BoundaryStatus />
        <!-- <GovEvents/> -->
      {/if}
    </div>
    <div class="uk-flex">
      <Validators />
    </div>
    <div class="uk-flex">
      <TransactionTable />
  </div>
</main>
