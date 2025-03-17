import { makeApp } from './server';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { L2Resolver } from './l2_resolver';

const program = new Command();
program
  .requiredOption(
    '-k --private-key <key>',
    'Private key to sign responses with. Prefix with @ to read from a file'
  )
  .requiredOption('-d --rpc-url <url>', 'RPC URL')
  .requiredOption('-c --l2-resolver-contract-address <address>', 'L2 resolver contract address')
  .option('-p --port <number>', 'Port number to serve on', '8080');

program.parse(process.argv);
const options = program.opts();

let privateKey = options.privateKey;
if (privateKey.startsWith('@')) {
  privateKey = ethers.utils.arrayify(
    readFileSync(privateKey.slice(1), { encoding: 'utf-8' })
  );
}

const signingAddress = ethers.utils.computeAddress(privateKey);
const signer = new ethers.utils.SigningKey(privateKey);

const app = makeApp(
  signer,
  '/',
  new L2Resolver(options.rpcUrl, options.l2ResolverContractAddress)
);

console.log(`Serving on port ${options.port}`);
console.log(`signingAddress: ${signingAddress}`);
console.log(`rpcUrl: ${options.rpcUrl}`);
console.log(`l2ResolverContractAddress: ${options.l2ResolverContractAddress}`);

app.listen(parseInt(options.port));

module.exports = app;
