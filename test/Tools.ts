import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import { ethers } from "hardhat";
  
  describe("Tools", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployToolsFixture() {
      const ToolsSuite = await ethers.getContractFactory("ToolsSuite", );
      const toolsSuite = await ToolsSuite.deploy();
  
      return toolsSuite;
    }

    describe("String Empty", function () {
        it("Should return false for non-empty string", async function () {
            const toolsSuite : any = await loadFixture(deployToolsFixture);

            expect(await toolsSuite.isStringEmpty('hello')).to.equal(false);
        });

        it("Should return true for empty string", async function () {
            const toolsSuite : any = await loadFixture(deployToolsFixture);
    
            expect(await toolsSuite.isStringEmpty('')).to.equal(true);
        });
    });

    describe("String Length", function () {
        it("Should return correct length for string", async function () {
            const toolsSuite : any = await loadFixture(deployToolsFixture);

            expect(await toolsSuite.stringLength('hello')).to.equal(5);
            expect(await toolsSuite.stringLength(' hello ')).to.equal(7);
        });
    });

    describe("To Lower", function () {
        it("Should return string in lower case", async function () {
            const toolsSuite : any = await loadFixture(deployToolsFixture);

            expect(await toolsSuite.toLower('Mary had a little lamb')).to.equal('mary had a little lamb');
            expect(await toolsSuite.toLower('mARY had A lITTlE lamb')).to.equal('mary had a little lamb');
        });
        it('zeroAddressTest should return true', async function(){
            const toolsSuite : any = await loadFixture(deployToolsFixture);

            expect(await toolsSuite.zeroAddressTest()).to.equal(true);
        })
    });

    // describe("Slice Max", function () {
    //     it("Should return expected value when end < len", async function () {
    //         const toolsSuite : any = await loadFixture(deployToolsFixture);

    //         expect(await toolsSuite.sliceMax(0, 2, 5)).to.equal(2);
    //     });

    //     it("Should return len -1 value when estart + end > len", async function () {
    //         const toolsSuite : any = await loadFixture(deployToolsFixture);

    //         expect(await toolsSuite.sliceMax(4, 2, 5)).to.equal(4);
    //     });
    // });
  });