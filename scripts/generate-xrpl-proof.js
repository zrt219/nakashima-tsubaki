const xrpl = require('xrpl');
const crypto = require('crypto');

async function main() {
  const client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
  await client.connect();
  
  console.log('Funding XRPL testnet wallet...');
  const { wallet } = await client.fundWallet();
  console.log('Wallet funded:', wallet.address);

  const payload = { app: 'IoT Maker', module: 'test', runId: 'run-' + Date.now() };
  const str = JSON.stringify(payload);
  const hash = crypto.createHash('sha256').update(str).digest('hex');

  const memoString = `app=${payload.app}|module=${payload.module}|runId=${payload.runId}|evidenceHash=${hash}`;

  const tx = {
    TransactionType: 'Payment',
    Account: wallet.address,
    Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe', // testnet destination
    Amount: '1', // 1 drop
    Memos: [{
      Memo: {
        MemoType: Buffer.from('proof', 'utf8').toString('hex'),
        MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex'),
        MemoData: Buffer.from(memoString, 'utf8').toString('hex')
      }
    }]
  };

  console.log('Submitting proof to XRPL Testnet...');
  const submitResult = await client.submitAndWait(tx, { wallet });
  const txHash = submitResult.result.hash;
  const ledgerIndex = submitResult.result.ledger_index;

  console.log('--- XRPL PROOF SUCCESS ---');
  console.log('Transaction Hash:', txHash);
  console.log('Ledger Index:', ledgerIndex);
  console.log('Explorer URL:', 'https://testnet.xrpl.org/transactions/' + txHash);

  await client.disconnect();
}
main().catch(console.error);
