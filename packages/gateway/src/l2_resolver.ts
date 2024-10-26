import { ethers } from 'ethers';
import { Database } from './server';

const DEFAULT_TTL = 300; // 5 minutes

const ABI = [
  // https://github.com/ensdomains/ens-contracts/blob/5421b5689e695531dc9739f0ad861839bdd231cb/contracts/resolvers/profiles/AddrResolver.sol#L35
  "function addr(bytes32) public view returns (address)"
];

export class L2Resolver implements Database {
  private provider: ethers.providers.JsonRpcProvider;
  private contract: ethers.Contract;

  constructor(darwiniaRpcUrl: string, l2ResolverAddress: string) {
    this.provider = new ethers.providers.JsonRpcProvider(darwiniaRpcUrl);
    this.contract = new ethers.Contract(l2ResolverAddress, ABI, this.provider);
  }

  async addr(name: string, coinType: number): Promise<{ addr: string; ttl: number }> {
    if (coinType !== 60) { // ETH coin type
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }

    // https://app.ens.domains/ringdao.eth
    if (name === 'ringdao.eth') {
      return { addr: '0x1D5C90E40A3b546a4Ff5cfFf7B2fF8FB7D2bfa32', ttl: DEFAULT_TTL };
    }

    // "a.b.ringdao.eth" is not allowed. only "a.ringdao.eth" is allowed.
    if (name.split('.').length > 3) {
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }

    try {
      console.log('querying db: name = ', name);
      const node = ethers.utils.namehash(name);
      console.log('querying db: node = ', node);
      const owner = await this.contract.addr(node);
      console.log('querying db: owner = ', owner);
      return { addr: owner, ttl: DEFAULT_TTL };
    } catch (error) {
      console.error('Error fetching subname owner:', error);
      return { addr: ethers.constants.AddressZero, ttl: DEFAULT_TTL };
    }
  }

  async text(_name: string, _key: string): Promise<{ value: string; ttl: number }> {
    // The SubnameRegistry doesn't support text records, so we'll return an empty string
    return { value: '', ttl: DEFAULT_TTL };
  }

  async contenthash(_name: string): Promise<{ contenthash: string; ttl: number }> {
    // The SubnameRegistry doesn't support contenthash, so we'll return an empty string
    return { contenthash: '0x', ttl: DEFAULT_TTL };
  }
}