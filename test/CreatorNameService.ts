import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";


describe("CreatorNameService", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployCreatorNameServiceFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
        const creatorNameService = await CreatorNameService.deploy();

        return {creatorNameService, owner, otherAccount};
    }

    describe("Deployment", function () {
        it("Should set Auth Role to sender.", async function () {
            const AUTH_ROLE = keccak256(toUtf8Bytes("AUTH_ROLE"));
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
      
            expect(await creatorNameService.hasRole(AUTH_ROLE, owner.address)).to.equal(true);
        });
    });

    describe("isCreatorNameAvailable", function () {
        it("Should show name available", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Kevin';
            expect(await creatorNameService.isCreatorNameAvailable(name)).to.equal(true);
        });
    });

    describe("setCreatorName", function () {
        it("Should create name record", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Mike';
            await expect(await creatorNameService.setCreatorName(owner.address, name))
            .to.emit(creatorNameService, "CreatorNameSet")
            .withArgs(owner.address, name);
        });

        it("Should not allow name to be set that already exists.", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Mike';
            await expect(await creatorNameService.setCreatorName(owner.address, name))
            .to.emit(creatorNameService, "CreatorNameSet")
            .withArgs(owner.address, name);

            await expect(creatorNameService.setCreatorName(owner.address, 'Mike')).to.be.revertedWith(
                "NAME NOT AVAILABLE"
              );
        });

        it("Should not allow name to be set that already exists by changing caps.", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Mike';
            await expect(await creatorNameService.setCreatorName(owner.address, name))
            .to.emit(creatorNameService, "CreatorNameSet")
            .withArgs(owner.address, name);

            await expect(creatorNameService.setCreatorName(owner.address, 'mIkE')).to.be.revertedWith(
                "NAME NOT AVAILABLE"
              );
        });

        it("Should not allow name to be changed once set", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Mike';
            await expect(await creatorNameService.setCreatorName(owner.address, name))
            .to.emit(creatorNameService, "CreatorNameSet")
            .withArgs(owner.address, name);

            await expect(creatorNameService.setCreatorName(owner.address, 'Clem')).to.be.revertedWith(
                "CREATOR NAME ALREADY SET"
              );
        });
    });

    describe("getCreatorId", function () {
        it("Should return creator's address by display name", async function () {
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Kevin';
            
            await expect(await creatorNameService.setCreatorName(owner.address, name));

            expect(await creatorNameService.getCreatorId(name)).to.equal(owner.address);
        });
    });


    describe("getCreatorName", function () {
        it("Should return display name by creator's address", async function () {     
            const { creatorNameService, owner, otherAccount } = await loadFixture(deployCreatorNameServiceFixture);
            const name = 'Kevin';

            await expect(await creatorNameService.setCreatorName(owner.address, name));

            expect(await creatorNameService.getCreatorName(owner.address)).to.equal(name);
        });
    });
});