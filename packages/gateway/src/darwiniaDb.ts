import { ethers } from 'ethers';
import { Database } from './server';

const DEFAULT_TTL = 300; // 5 minutes

const ABI = [
  "function addr(bytes32) view returns (address)",
  "function text(bytes32, string) view returns (string)"
];

export class DarwiniaDatabase implements Database {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(rpc_url: string, l2_resolver_contract_address: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpc_url);
    this.contract = new ethers.Contract(l2_resolver_contract_address, ABI, this.provider);
  }

  async addr(name: string, coinType: number): Promise<{ addr: string; ttl: number }> {
    console.log(`   - querying address: "${name}", coinType: ${coinType}`);

    if (coinType !== 60) { // ETH coin type
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }

    if (name === 'darwinia.eth') {
      return { addr: '0x1234567890123456789012345678901234567890', ttl: DEFAULT_TTL };
    }

    // "a.b.ringdao.eth" is not allowed. only "a.ringdao.eth" is allowed.
    if (name.split('.').length > 3) {
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }

    try {
      const node = ethers.utils.namehash(name)
      const address = await this.contract.addr(node);
      console.log(`     address of "${name}" is "${address}"`);
      return { addr: address, ttl: DEFAULT_TTL };
    } catch (error) {
      console.error('     error resolving name:', error);
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }
  }

  async text(name: string, key: string): Promise<{ value: string; ttl: number }> {
    console.log(`   - querying text record: "${name}", key: "${key}"`);

    if (name === 'darwinia.eth' || name.split('.').length > 3) {
      return { value: 'hello', ttl: DEFAULT_TTL };
    }

    try {
      const node = ethers.utils.namehash(name)
      const record = await this.contract.text(node, key);
      console.log(`     text record of "${name}"."${key}" is "${record}"`);
      return { value: record, ttl: DEFAULT_TTL };
    } catch (error) {
      console.error('     error resolving text record:', error);
      return { value: '', ttl: DEFAULT_TTL };
    }
  }

  async contenthash(name: string): Promise<{ contenthash: string; ttl: number }> {
    console.log(`   - querying contenthash: "${name}"`);
    // The SubnameRegistry doesn't support contenthash, so we'll return an empty string
    return { contenthash: '0x', ttl: DEFAULT_TTL };
  }
}
