import {
    loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";

const creatorName1 = 'ABCDEF';
const creatorName2 = 'deadbeef';
const creatorName3 = 'b46c0dE';

const altAddress = "0x8C96b64e7F99051639DEa2F2B1097E7a3b56aC4B";

describe("AssetProvenance", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployAssetFactoryFixture_Deploy() {
        // Contracts are deployed using the first signer/account by default
        const AUTH_ROLE = keccak256(toUtf8Bytes("AUTH_ROLE"));
        const [owner, otherAccount] = await ethers.getSigners();
        const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
        const creatorNameService = await CreatorNameService.deploy();
        const AssetCreatorFactory= await ethers.getContractFactory("AssetCreatorFactory", );
        const assetCreatorFactory = await AssetCreatorFactory.deploy(creatorNameService.getAddress());

        // Make factory contract an auth of creator name service.
        await creatorNameService.grantRole(AUTH_ROLE, assetCreatorFactory.getAddress());

        await expect(await creatorNameService.setCreatorName(owner.address, creatorName1));
        await expect(await creatorNameService.setCreatorName(altAddress, creatorName2));
        await expect(await creatorNameService.setCreatorName(otherAccount.address, creatorName3));

        return {assetCreatorFactory, creatorNameService, owner, otherAccount};
    }

    describe("Deploy Asset Creator Factory", function () {
    
        it("Should deploy successfully.", async function () {
            const { assetCreatorFactory, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetFactoryFixture_Deploy);
            const story = 'The creators story goes here.';
            const url = 'https://createdbyme.io/ipfs/abcdeadbeef123';
            let addr = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c';
            await expect(await assetCreatorFactory.deployCreatorContract(owner.address, story, url))
                .to.emit(assetCreatorFactory, "AssetProvenanceGenerated")
                .withArgs(owner.address, addr, story, owner.address);
        });

        it("Should store creator's asset contract address.", async function () {
            const { assetCreatorFactory, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetFactoryFixture_Deploy);
            const story = 'The creators story goes here.';
            const url = 'https://createdbyme.io/ipfs/abcdeadbeef123';
            let addr = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c';
            const p = [];
            p.push(assetCreatorFactory.deployCreatorContract(owner.address, story, url));
            p.push(assetCreatorFactory.deployCreatorContract(altAddress, story, url));
            p.push(assetCreatorFactory.deployCreatorContract(otherAccount.address, story, url));

            await Promise.all(p);

            const resp = await assetCreatorFactory.getRegisteredCreators(0, 100);
            expect(resp.totalCount).to.equal(3);
            expect(resp.count).to.equal(3);
            expect(resp.creatorAddresses[0]).to.equal(addr);

        });

        it("Should pair creators id with creator's asset contract address.", async function () {
            const { assetCreatorFactory, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetFactoryFixture_Deploy);
            const story = 'The creators story goes here.';
            const url = 'https://createdbyme.io/ipfs/abcdeadbeef123';
            let addr = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c';
            
            await assetCreatorFactory.deployCreatorContract(owner.address, story, url);

            const resp = await creatorNameService.getCreatorAssetProvenanceAddress(owner.address);
            expect(resp).to.equal(addr);

            
        });
    });
});