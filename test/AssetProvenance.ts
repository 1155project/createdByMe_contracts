import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes, formatBytes32String, parseBytes32String } from "@ethersproject/strings";
import { Buffer } from "buffer";

const altAddress = "0x8C96b64e7F99051639DEa2F2B1097E7a3b56aC4B";

const deployData1= {id: '', name: 'Clem', story: 'This is my story'};
const deployData2= {id: altAddress, name: 'John', story: 'He trusts his fist against the post and still insists he sees the ghost.'};

const decode = (str: string):string => Buffer.from(str, 'base64').toString('binary');
const encode = (str: string):string => Buffer.from(str, 'binary').toString('base64');

describe("AssetProvenance", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployAssetProvenanceFixture_Deploy1() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
        const creatorNameService = await CreatorNameService.deploy();

        await expect(await creatorNameService.setCreatorName(owner.address, deployData1.name));
        const AssetProvenance = await ethers.getContractFactory("AssetProvenance");
        const assetProvenance = await AssetProvenance.deploy(owner.address, creatorNameService.getAddress(), deployData1.story, "https://www.createdbyme.io?id={0}");

        return {assetProvenance, creatorNameService, owner, otherAccount};
    }

    async function deployAssetProvenanceFixture_Deploy2() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();
        const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
        const creatorNameService = await CreatorNameService.deploy();

        await expect(await creatorNameService.setCreatorName(deployData2.id, deployData2.name));
        const AssetProvenance = await ethers.getContractFactory("AssetProvenance");
        const assetProvenance = await AssetProvenance.deploy(deployData2.id, creatorNameService.getAddress(), deployData2.story, "https://www.createdbyme.io?id={0}");

        return {assetProvenance, creatorNameService, owner, otherAccount};
    }

    describe("Deployment", function () {
        it("Should set Auth Role to sender.", async function () {
            const AUTH_ROLE = keccak256(toUtf8Bytes("AUTH_ROLE"));
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            expect(await assetProvenance.hasRole(AUTH_ROLE, owner.address)).to.equal(true);
        });

        it("Should register creator with nameservice.", async function () {
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            expect(await creatorNameService.getCreatorName(owner.address)).to.equal(deployData1.name);
        });

        it("Should create creator record.", async function () {

            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            const { creator,  displayName, story, assetCount} = await assetProvenance.getCreatorMetadata();
            expect(creator).to.equal(owner.address);
            expect(displayName).to.equal(deployData1.name);
            expect(story).to.equal(deployData1.story);
        });

        //            
        // it("Should revert when creator is not registered.", async function () {
        //     const [owner, otherAccount] = await ethers.getSigners();
        //     const CreatorNameService = await ethers.getContractFactory("CreatorNameService", );
        //     const creatorNameService = await CreatorNameService.deploy();
    
        //     const AssetProvenance = await ethers.getContractFactory("AssetProvenance");
        //     const AssetProvenanceStorage = await ethers.getContractFactory("AssetStorage");
    
        //     await expect(await AssetProvenance.deploy(deployData2.id, creatorNameService.getAddress(), deployData2.story, "https://www.createdbyme.io?id={0}"))
        //     .to.be.revertedWithCustomError(
        //         AssetProvenanceStorage,
        //         "Creator display name is required."
        //       );
        // });

        it("Should register client creator with nameservice.", async function () {
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy2);

            expect(await creatorNameService.getCreatorName(deployData2.id)).to.equal(deployData2.name);
        });

        it("Should client create creator record.", async function () {
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy2);

            const { creator,  displayName, story, assetCount} = await assetProvenance.getCreatorMetadata();
            expect(creator).to.equal(deployData2.id);
            expect(displayName).to.equal(deployData2.name);
            expect(story).to.equal(deployData2.story);
        });

    });

    describe("Series", function () {
        it("Should create a series", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr = 'Series description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, 'Series description here.');

            const seriesDescr = await assetProvenance.getSeriesMetadata(seriesId);

            expect(seriesDescr).to.equal(descr);
        });

        it("Should emit SeriesCreated", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr = 'Series description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            await expect(await assetProvenance.createSeries(seriesId, 'Series description here.'))
                .to.emit(assetProvenance, "SeriesCreated")
                .withArgs(owner.address, seriesId, descr, owner.address);
        });


        it("Should revert if series already exists.", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr = 'ABCDEFGHIJKLMNOP';

            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, descr);

            await expect(assetProvenance.createSeries(seriesId, descr)).to.be.revertedWith(
                "SERIES EXISTS"
              );
        });

        it("Should revert id description is too large", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr = 'ABCDEFGHIJKLMNOP';

            for(var i = 0; i < 6; i++) {
                descr = descr + descr;
            }

            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            await expect(assetProvenance.createSeries(seriesId, descr)).to.be.revertedWith(
                "DESCRIPTION TOO LARGE"
              );
        });

        it("Should update series description", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr1 = 'Series description here.';
            let descr2 = 'He thrusts his fist against the post and still insists he sees the ghost.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, 'Series description here.');

            const seriesDescr1 = await assetProvenance.getSeriesMetadata(seriesId);

            expect(seriesDescr1).to.equal(descr1);

            await assetProvenance.updateSeriesDescription(seriesId, descr2);
            const seriesDescr2 = await assetProvenance.getSeriesMetadata(seriesId);

            expect(seriesDescr2).to.equal(descr2);
        });
        
        it("Should return a list of series", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId1 = formatBytes32String('GILDED SHAPES');
            let seriesId2 = formatBytes32String('RED SANDS');
            let seriesId3 = formatBytes32String('SPECIAL');
            let descr = 'Series description here.';
            const seriesList = [seriesId1, seriesId2, seriesId3];
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId1, 'Series description here.');
            await assetProvenance.createSeries(seriesId2, 'Series description here.');
            await assetProvenance.createSeries(seriesId3, 'Series description here.');

            const {seriesIds, count, totalCount} = await assetProvenance.getSeriesList(0,100);

            expect(count).to.equal(3);
            expect(totalCount).to.equal(3);
            for(var i = 0; i < count; i++) {
                expect(seriesIds[i]).to.equal(seriesList[i]);
            }
        });

        it("Pagination works as expected", async function () {
            const sid = 'ABCDE';
            const sids = [];
            const size = 100;

            let descr = 'Series description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            const p = [];

            for(let i = 0; i < size; i++) {
                const s = formatBytes32String(sid+i);
                sids.push(s);
                p.push(assetProvenance.createSeries(s, `${descr}_${i}`));
            }
            
            await Promise.all(p);
            let idx = 0;
            const pageSize = 30;

            for (let i = 0; i < 3; i++) {
                const {seriesIds, count, totalCount} = await assetProvenance.getSeriesList(idx, pageSize);

                const n = parseInt(count.toString()) - 1;
                const n1 = idx  + n;

                expect(count).to.equal(pageSize);
                expect(totalCount).to.equal(size);
                expect(seriesIds[0]).to.equal(sids[idx]);
                expect(seriesIds[n]).to.equal(sids[n1]);

                idx += (n + 1);
            }

            const {seriesIds, count, totalCount} = await assetProvenance.getSeriesList(idx, pageSize);
            const n = parseInt(count.toString()) - 1;
            const n1 = idx  + n;

            expect(count).to.equal(10);
            expect(totalCount).to.equal(size);
            expect(seriesIds[0]).to.equal(sids[idx]);
            expect(seriesIds[n]).to.equal(sids[n1]);
        });
    });

    describe("Assets", function () {
        it("Should create an Asset", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags);

            const {id, tags, description, creator, seriesId, url, documentHash} = await assetProvenance.getAssetMetadata(assetId);

            expect(id).to.equal(assetId);
            expect(tags.length).to.equal(3);
            expect(seriesId).to.equal(assetSeriesId);
        });

        it("Should emit AssetRegistered", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await expect(await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags))
            .to.emit(assetProvenance, "AssetRegistered")
            .withArgs(assetId, descr, assetSeriesId, owner.address, owner.address);
        });

        it("Should return an Asset", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags);

            const {id, tags, description, creator, seriesId, url, documentHash} = await assetProvenance.getAssetMetadata(assetId);
            
            expect(id).to.equal(assetId);
            expect(tags.length).to.equal(3);
            expect(seriesId).to.equal(assetSeriesId);
            expect(description).to.equal(descr);
            expect(creator).to.equal(owner.address);
        });

        it("Should revert if asset exists", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags);

            await expect(assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags)).to.be.revertedWith(
                "ASSET ALREADY REGISTERED"
            );
        });

        it("Should revert if description too large", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'ABCDEFGHIJKLMNOP';

            for(var i = 0; i < 6; i++) {
                descr = descr + descr;
            }
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await expect(assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags)).to.be.revertedWith(
                "DESCRIPTION TOO LARGE"
            );
        });
    });

    describe("Assets Description", function () {
        it("Should update an asset's description", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr1 = 'Asset description here.';
            let descr2 = '99 Red Balloons';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr1, assetTags);

            let {id, tags, description, creator, seriesId, url, documentHash} = await assetProvenance.getAssetMetadata(assetId);

            expect(description).to.equal(descr1);

            await assetProvenance.updateAssetDescription(assetId, descr2)

            let resp = await assetProvenance.getAssetMetadata(assetId);
            
            expect(resp.description).to.equal(descr2);
        });

        it("Should revert if description too large", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'ABCDEFGHIJKLMNOP';

            for(var i = 0; i < 6; i++) {
                descr = descr + descr;
            }
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, 'abcdef', assetTags);

            await expect(assetProvenance.updateAssetDescription(assetId, descr)).to.be.revertedWith(
                "DESCRIPTION TOO LARGE"
            );
        });
    });

    describe("Series Assets", function () {        
        it("Should return assets for seriesId", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr1 = 'He thrusts his fist against the post and still insists he sees the ghost.';

            const assetIds = ['0xA010dEaDBeEf002', '0xdEadBeef', '0xb0664C0dE'];
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            let descr = 'Asset description here.';


            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, descr1);

            const p = [];

            for(let i = 0; i < assetIds.length; i++) {
                p.push(assetProvenance.registerAsset(assetIds[i], seriesId, descr, assetTags));
            }

            await Promise.all(p);

            const resp = await assetProvenance.getAssetsBySeries(seriesId, 0, 10);

            expect(resp.count).to.equal(3);
            expect(resp.totalCount).to.equal(3);

            for(let i = 0; i < resp.count; i++) {
                expect(resp.assetIds[i]).to.equal(assetIds[i]);
            }
        });

        it("Should revert with invalid pagesize", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr1 = 'He thrusts his fist against the post and still insists he sees the ghost.';

            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, descr1);

            await expect(assetProvenance.getAssetsBySeries(seriesId, 0, 105)).to.be.revertedWith(
                "INVALID PAGESIZE"
            );
        });

        it("Should return empty result when no assets added to series.", async function () {
            const sid = 'GILDED SHAPES';
            let seriesId = formatBytes32String(sid);
            let descr1 = 'He thrusts his fist against the post and still insists he sees the ghost.';

            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);
            
            await assetProvenance.createSeries(seriesId, descr1);

            const resp = await assetProvenance.getAssetsBySeries(seriesId, 0, 10);

            expect(resp.count).to.equal(0);
            expect(resp.totalCount).to.equal(0);
            expect(resp.assetIds[0]).to.equal('0');
        });
    });

    describe("Asset tags", function () {        
        it("Should emit AssetTagsAdded", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await expect(await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags))
            .to.emit(assetProvenance, "AssetTagsAdded")
            .withArgs(assetId, assetTags);
        });

           
        it("Should add tag", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags);

            let resp = await assetProvenance.getAssetMetadata(assetId);

            expect(resp.tags.length).to.equal(2);

            const target =  formatBytes32String('ELITE');

            await assetProvenance.addTagToAsset(assetId, target);

            resp = await assetProvenance.getAssetMetadata(assetId);

            expect(resp.tags.length).to.equal(3);
            expect(resp.tags[2]).to.equal(target);
        });

        it("Should remove a tag", async function () {
            const sid = 'GILDED SHAPES';
            const assetId = '0xA010dEaDBeEf002';
            const assetTags = [formatBytes32String('WOODWORKING'), formatBytes32String('KITCHEN'), formatBytes32String('ELITE')];
            const assetSeriesId = formatBytes32String(sid);
            let descr = 'Asset description here.';
            const [baseOwner, someOtherAccount] = await ethers.getSigners();
            const { assetProvenance, creatorNameService, owner, otherAccount } = await loadFixture(deployAssetProvenanceFixture_Deploy1);

            await assetProvenance.registerAsset(assetId, assetSeriesId, descr, assetTags);

            let resp = await assetProvenance.getAssetMetadata(assetId);

            expect(resp.tags.length).to.equal(3);

            const target =  formatBytes32String('ELITE');

            await assetProvenance.removeTagFromAsset(assetId, formatBytes32String('KITCHEN'));

            resp = await assetProvenance.getAssetMetadata(assetId);

             expect(resp.tags[0]).to.equal(assetTags[0]);
             expect(resp.tags[1]).to.equal(assetTags[2]);
             expect(Number(resp.tags[2])).to.equal(0);
        });
    });
});